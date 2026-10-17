# Chemical Market — Comprehensive Codebase Review & Issue Registry

**Review Date:** October 2026  
**Scope:** Full-stack codebase audit of the B2B Chemical Marketplace repository, including:
- Express API server (`server/src/`)
- Prisma ORM schema & PostgreSQL migrations (`server/prisma/`)
- React 19 / Vite client (`client/src/`)
- Authentication, session security & authorization
- Business logic (Catalogue, Orders, Pricing, Shipping, CMS, Customer Onboarding)
- UI/UX, routing, accessibility & state management

---

## Executive Summary

The Chemical Market codebase is structured as a B2B chemical marketplace with customer ordering, admin product/content/shipping management, and audit logging. While core foundations (role guards, basic rate limits, image/document signature checks, Prisma relations) are established, this comprehensive review revealed **17 critical and high-priority problems** across database concurrency, authentication/refresh token races, customer approval workflows, missing routes, character encoding corruptions, and UI state management.

### Issues by Severity

| Severity | Count | Primary Impact |
|:---|:---:|:---|
| **P0 — Critical** | 3 | Concurrency crashes, data collision, security bypass of customer approval |
| **P1 — High** | 6 | User logout races, broken CMS sections, corrupted text, broken signout, SPA reload penalty |
| **P2 — Medium** | 6 | Missing address UI, broken password reset routing, cursor jumping, silent API failures |
| **P3 — Low** | 2 | Database image ID churn, linter warnings & unused code |

---

## 1. P0 — Critical Issues

### 1.1. Concurrency Race Condition & Data Collision in Order Number Generation
- **Affected File:** `server/src/modules/orders/orders.router.js` (lines 37–39)
- **Problem:**
  Order numbers are generated using `tx.orderRequest.count()` within a year range:
  ```javascript
  const sequence = await tx.orderRequest.count({
    where: { createdAt: { gte: new Date(y, 0, 1), lt: new Date(y + 1, 0, 1) } }
  });
  const orderNumber = `CHM-${y}-${String(sequence + 1).padStart(6, '0')}`;
  ```
  1. **Race Condition:** Two concurrent customer checkout requests will count the identical number of rows and generate the same `orderNumber`. Since `orderNumber` is `@unique` in `schema.prisma`, one transaction will crash with a unique constraint violation (`P2002`) or a PostgreSQL Serializable isolation conflict (`40001`).
  2. **Row Count Fallacy:** If any order is deleted or cancelled, row count decreases, resulting in an `orderNumber` collision with an existing order.
  3. **Unhandled Crash:** Line 39 only handles `P2002` if the client sent an `idempotencyKey` and it matches the same user. A concurrent collision from another customer bubbles up as an unhandled 500 error.
- **Fix:**
  Use an atomic PostgreSQL sequence or dedicated counter table:
  ```sql
  CREATE SEQUENCE IF NOT EXISTS order_number_seq;
  ```
  ```javascript
  const [{ nextval }] = await tx.$queryRaw`SELECT nextval('order_number_seq')::int`;
  const orderNumber = `CHM-${y}-${String(nextval).padStart(6, '0')}`;
  ```
  Alternatively, implement an optimistic retry loop for collision handling.

---

### 1.2. Complete Bypass of Customer Approval & Missing Approval Endpoints
- **Affected Files:**
  - `server/prisma/schema.prisma` (`isApproved Boolean @default(false)`)
  - `server/src/modules/auth/auth.service.js` (lines 78, 97)
  - `server/src/middleware/authenticate.js` (line 40)
  - `server/src/modules/orders/orders.router.js` (line 27)
  - `server/src/modules/admin/admin.router.js` (lines 20–23)
  - `client/src/pages/admin/CustomersAdminPage.jsx` (lines 7, 9)
  - `client/src/pages/auth/AuthPage.jsx` (line 46)
- **Problem:**
  The schema and documentation state: `isApproved Boolean @default(false) // admin must approve before ordering`. The registration page tells customers: `"Registration received. Sign in after your account is approved."`
  However:
  1. **Ordering Check Missing:** `orders.router.js` (`router.post('/order-request')`) only checks `authenticate, requireCustomer`. It never verifies `req.user.isApproved`. Any freshly registered user with `isApproved: false` can submit order requests immediately.
  2. **Authentication Check Missing:** `auth.service.js` `loginUser()` only validates `user.isActive`. Unapproved users can log in immediately.
  3. **Authenticate Middleware Does Not Select `isApproved`:** `authenticate.js` explicitly selects only `{ id: true, email: true, role: true, isActive: true }`.
  4. **No Admin Approval API:** `admin.router.js` only provides `PATCH /customers/:id/status` to toggle `isActive`. There is no route to toggle or approve `isApproved`.
  5. **No Admin UI:** `CustomersAdminPage.jsx` does not display approval status or provide an "Approve" button.
- **Fix:**
  1. Add `isApproved` to `authenticate.js` selection and attach to `req.user`.
  2. In `orders.router.js`, verify `if (!req.user.isApproved) throw forbidden('Your account is pending admin approval before requesting orders.');`.
  3. In `admin.router.js`, add `PATCH /customers/:id/approval` with `{ isApproved: boolean }`.
  4. In `CustomersAdminPage.jsx`, add an approval badge and "Approve Customer" action button.

---

### 1.3. Prisma Client Generation Blocked on Windows by Server Process Locks
- **Affected Files:**
  - `server/node_modules/.prisma/client/query_engine-windows.dll.node`
  - `server/prisma/migrations/20261013120000_company_sequential_number/`
  - `server/prisma/migrations/20261013130000_catalogue_sequential_numbers/`
- **Problem:**
  Running `npm run generate --prefix server` fails with:
  `EPERM: operation not permitted, rename '...query_engine-windows.dll.node.tmp...' -> '...query_engine-windows.dll.node'`
  This occurs because active `node src/server.js` processes hold an OS-level file lock on the query engine DLL.
  Because generation failed, the newly migrated sequential display numbers (`companyNumber`, `categoryNumber`, `brandNumber`, `productNumber`) are not yet reflected in the generated Prisma Client, risking runtime type mismatches or missing property errors.
- **Fix:**
  Terminate running dev node processes prior to running `npm run generate --prefix server`.

---

## 2. P1 — High-Priority Issues

### 2.1. Concurrent Refresh Token Race Condition Causing Random User Logouts
- **Affected Files:**
  - `client/src/lib/api.js` (lines 19–33)
  - `server/src/modules/auth/auth.service.js` (lines 184–219)
- **Problem:**
  `server` rotates refresh tokens and immediately deletes the old token upon use:
  ```javascript
  const stored = await prisma.refreshToken.findUnique({ where: { token: rawToken } });
  if (!stored) throw unauthorized("Refresh token not recognised (possible reuse)");
  await prisma.refreshToken.delete({ where: { id: stored.id } });
  ```
  On the client, if two or more API calls fail with 401 simultaneously (common when loading a dashboard, catalogue filters, or customer profile on initial load):
  - Both requests trigger `api.interceptors.response`.
  - Request #1 calls `/api/auth/refresh`, rotates the token, and deletes the old one.
  - Request #2 calls `/api/auth/refresh` with the now-deleted old token.
  - Request #2 receives 401 `"Refresh token not recognised"`.
  - Line 30 of `api.js` executes: `catch (refreshError) { setAccessToken(null); return Promise.reject(refreshError); }`.
  - The user is abruptly logged out of their session.
- **Fix:**
  In `client/src/lib/api.js`, wrap token refresh in a single in-flight promise (mutex queue). All concurrent 401 requests must await the same single refresh promise instead of dispatching separate HTTP requests.

---

### 2.2. Homepage SectionType Enum Mismatch Crashing Content Updates
- **Affected Files:**
  - `server/src/modules/content/content.router.js` (line 29)
  - `server/prisma/schema.prisma` (lines 85–98)
  - `client/src/pages/admin/ContentAdminPages.jsx` (line 2)
- **Problem:**
  Prisma `SectionType` defines 12 enum members:
  `HERO_BANNER`, `FEATURED_CATEGORIES`, `FEATURED_PRODUCTS`, `FEATURED_BRANDS`, `COMPANY_INTRO`, `ORDERING_STEPS`, `BLOG_HIGHLIGHTS`, `CONTACT_CTA`, `FOOTER`, `ANNOUNCEMENT`, `TESTIMONIALS`, `CUSTOM_HTML`.
  The frontend UI allows admins to choose all these types.
  However, in `content.router.js`:
  ```javascript
  const sectionInput = z.object({
    type: z.enum(['HERO_BANNER','FEATURED_CATEGORIES','FEATURED_PRODUCTS','ANNOUNCEMENT','TESTIMONIALS','CUSTOM_HTML']),
    ...
  });
  ```
  Saving sections like `FEATURED_BRANDS`, `COMPANY_INTRO`, `ORDERING_STEPS`, `BLOG_HIGHLIGHTS`, `CONTACT_CTA`, or `FOOTER` throws a 422 Zod validation error: `Invalid enum value`.
- **Fix:**
  Update `sectionInput` in `content.router.js` to include all 12 enum values.

---

### 2.3. Mojibake / Corrupted Character Encoding in Shipping Admin Page
- **Affected File:** `client/src/pages/admin/ShippingAdminPage.jsx` (lines 9–10)
- **Problem:**
  The file was saved or converted with mismatched character encoding (UTF-8 bytes interpreted as Windows-1252):
  - `Base rate (â‚¹)` instead of `Base rate (₹)`
  - `Rate per kg (â‚¹)` instead of `Rate per kg (₹)`
  - `m.description||'â€”'` instead of `—`
  - `stateName(r.originState) â†’ stateName(r.destinationState)` instead of `→`
  - `â‚¹{Number(r.basePrice).toFixed(2)}` instead of `₹`
  - `{r.minWeightKg??0}â€“{r.maxWeightKg??'âˆž'} kg` instead of `0–∞ kg`
- **Fix:**
  Correct the corrupted characters back to valid UTF-8 symbols (`₹`, `→`, `–`, `∞`, `—`).

---

### 2.4. Product Detail Gallery Image Click Broken When Variant Has Image
- **Affected File:** `client/src/pages/public/ProductDetailPage.jsx` (lines 20, 23)
- **Problem:**
  The main image is determined by:
  ```javascript
  const visibleImage = activeVariant?.imageUrl || images[imageIndex]?.url;
  ```
  If an active variant has an `imageUrl`, `activeVariant?.imageUrl` is always truthy. When users click gallery thumbnails (`setImageIndex(i)`), `visibleImage` never updates because the OR operator evaluates the variant image first.
- **Fix:**
  Track user thumbnail selection explicitly:
  ```javascript
  const [selectedImage, setSelectedImage] = useState(null);
  useEffect(() => { setSelectedImage(activeVariant?.imageUrl || null); }, [variantId]);
  const visibleImage = selectedImage || images[imageIndex]?.url;
  ```

---

### 2.5. Full-Page Browser Hard-Reloads in Navigation (SPA Anti-Pattern)
- **Affected Files:**
  - `client/src/components/layout/PublicLayout.jsx` (navbar, drawer, footer)
  - `client/src/components/layout/AdminLayout.jsx` (sidebar links)
  - `client/src/components/ui/Cards.jsx` (`ProductCard`, `CategoryCard`, `BlogCard`)
- **Problem:**
  Components use raw HTML `<a href="...">` tags rather than React Router's `<Link to="...">`:
  - `PublicLayout.jsx`: `<a href="/products">`, `<a href="/auth/login">`, `<a href="/auth/register">`
  - `AdminLayout.jsx`: `<a href={item.href}>` for all sidebar items
  - `Cards.jsx`: `<a href={`/products/${slug}`}>`, `<a href={`/products?category=${slug}`}>`
  Clicking any link triggers a full browser refresh, discarding React state, wiping in-memory access tokens, and forcing redundant `/auth/refresh` HTTP requests.
- **Fix:**
  Replace `<a href="...">` with `<Link to="...">` from `react-router-dom`.

---

### 2.6. Broken Admin Sign Out in TopBar User Menu
- **Affected File:** `client/src/components/layout/AdminLayout.jsx` (line 174)
- **Problem:**
  The top bar user dropdown menu has:
  ```jsx
  <a role="menuitem" href="/auth/logout" className="...">Sign out</a>
  ```
  1. There is no `/auth/logout` route in `App.jsx`. Clicking this navigates to the 404 page.
  2. It does not call `onSignOut` or `logout()`. The session remains active.
- **Fix:**
  Change this into a button calling `onSignOut` or `handleSignOut()`.

---

## 3. P2 — Medium-Priority Issues

### 3.1. Customer Address Management UI is Completely Missing
- **Affected Files:**
  - `client/src/pages/customer/AccountProfilePage.jsx`
  - `client/src/pages/customer/OrdersPage.jsx`
  - `server/src/modules/customer/customer.router.js`
- **Problem:**
  The server supports full address CRUD (`/api/customer/addresses`). However:
  1. `AccountProfilePage.jsx` provides no UI for customers to view, add, edit, or delete shipping addresses.
  2. `OrderRequestPage` does not fetch customer addresses; customers must manually re-type their full shipping address every time they submit an order.
- **Fix:**
  1. Add an "Addresses" tab/section in `AccountProfilePage.jsx`.
  2. In `OrderRequestPage`, load saved addresses and provide a dropdown to auto-fill the shipping address form.

---

### 3.2. Missing Password Reset and About Pages in Frontend Router
- **Affected File:** `client/src/App.jsx` (lines 64, 70, 107)
- **Problem:**
  1. `/about` renders a placeholder.
  2. `/auth/forgot-password` renders a placeholder.
  3. `/auth/reset-password` does not exist in routes. When a user clicks the password reset link from their email (`/auth/reset-password?token=...`), they land on the 404 catch-all route.
- **Fix:**
  Implement forgot password and reset password views, and add `<Route path="/auth/reset-password" element={<ResetPasswordPage />} />` to `App.jsx`.

---

### 3.3. RichTextEditor Cursor Position Reset on Every Keystroke
- **Affected File:** `client/src/components/ui/RichTextEditor.jsx` (line 4)
- **Problem:**
  The component sets `dangerouslySetInnerHTML={{ __html: value || '' }}` while emitting `onInput={e => onChange(e.currentTarget.innerHTML)}`.
  Every time the parent component receives `onChange`, it re-renders and re-supplies `value`, causing React to re-set the `innerHTML`. This resets the caret/cursor to the beginning of the text, making blog editing frustrating.
- **Fix:**
  Store content in a local ref or state, initializing once on mount, and only propagate updates out to parent without re-rendering the inner HTML during active input.

---

### 3.4. Silent Swallowing of API Errors on Public Pages
- **Affected Files:**
  - `client/src/pages/public/ProductsPage.jsx` (line 15: `.catch(()=>{})`)
  - `client/src/pages/public/BlogPages.jsx` (line 2: `.catch(()=>setResult({items:[],meta:{page:1,totalPages:1}}))`)
  - `client/src/pages/public/HomePage.jsx` (line 11: `.catch(()=>{})`)
- **Problem:**
  Network or server errors are silently suppressed:
  - In `ProductsPage.jsx`, if categories or brands fail to load, filter dropdowns stay empty with no notice.
  - In `BlogPages.jsx`, an API failure displays `"No published articles found"`, misleading users.
  - In `HomePage.jsx`, failure of any catalogue/content endpoint leaves sections completely blank.
- **Fix:**
  Add explicit error handling and error states with retry buttons.

---

### 3.5. Orders Admin Transition Dropdown Allows Invalid Status Transitions
- **Affected File:** `client/src/pages/admin/OrdersAdminPage.jsx` (line 115)
- **Problem:**
  The dropdown displays all statuses: `statuses.filter(value => value !== order.status)`.
  However, the backend enforces state machine transitions:
  ```javascript
  const transitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['PROCESSING', 'CANCELLED'],
    PROCESSING: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: []
  };
  ```
  Admins selecting non-permitted statuses receive an unhelpful 409 Conflict error.
- **Fix:**
  Populate the dropdown using `transitions[order.status] || []`.

---

### 3.6. In-Memory Order Processing Scalability in Admin Dashboard
- **Affected File:** `server/src/modules/admin/admin.router.js` (line 18)
- **Problem:**
  `/api/admin/dashboard` retrieves all orders created in the last 30 days:
  ```javascript
  prisma.orderRequest.findMany({ where: { createdAt: { gte: start } }, select: { createdAt: true, status: true } });
  ```
  It then iterates through every record in a JavaScript loop to aggregate daily counts. As volume grows, this causes memory pressure and high database latency.
- **Fix:**
  Use PostgreSQL date grouping:
  ```sql
  SELECT date_trunc('day', created_at) AS day, count(*)::int AS count
  FROM order_requests
  WHERE created_at >= $1
  GROUP BY 1 ORDER BY 1;
  ```

---

## 4. P3 — Low-Priority / Code Cleanliness Issues

### 4.1. Product Images & Documents Recreated with New IDs on Every Save
- **Affected File:** `server/src/modules/products/products.router.js` (lines 61–62)
- **Problem:**
  On product update, all existing `productImage` and `productDocument` records are deleted and re-inserted:
  ```javascript
  await tx.productImage.deleteMany({ where: { productId: product.id } });
  await tx.productImage.createMany({ ... });
  ```
  This causes database ID churn and breaks any foreign-key links or cached asset IDs.
- **Fix:**
  Diff images and documents by `cloudinaryId` to retain existing record IDs.

---

### 4.2. Oxlint / ESLint Code Warnings
- **Affected Files:**
  - `client/src/App.jsx`: `Navigate` imported but unused.
  - `client/src/components/layout/AdminLayout.jsx`: `initials` imported but unused.
  - `client/src/pages/auth/AuthPage.jsx`: `signedIn` assigned but unused.
  - `client/src/pages/customer/AccountProfilePage.jsx`: `useEffect` missing dependency `profile`.
  - `client/src/pages/customer/OrdersPage.jsx`: `setState` synchronously called in effect.
- **Fix:**
  Remove unused imports and clean up hook dependency arrays.

---

## 5. Verification Checklist

- [ ] Stop node servers and run `npm run generate` in `server/`.
- [ ] Implement atomic sequence / safe counter for `orderNumber`.
- [ ] Add `isApproved` check to `orders.router.js` and admin customer management.
- [ ] Add mutex queue to `client/src/lib/api.js` for token refresh.
- [ ] Update `SectionType` enum in `content.router.js`.
- [ ] Fix corrupted characters in `ShippingAdminPage.jsx`.
- [ ] Switch `<a href="...">` to `<Link to="...">` in `PublicLayout.jsx`, `AdminLayout.jsx`, and `Cards.jsx`.
- [ ] Fix `visibleImage` logic in `ProductDetailPage.jsx`.
- [ ] Fix sign out button in `AdminLayout.jsx` TopBar.
- [ ] Add `/auth/reset-password` route and page.
- [ ] Add customer address manager in `AccountProfilePage.jsx`.
- [ ] Restrict status transitions in `OrdersAdminPage.jsx`.

