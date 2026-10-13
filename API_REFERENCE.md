# API Reference

Base URL: `http://localhost:5000/api`. JSON responses use `{ "success": true|false, "data": ..., "message": "...", "errors": ... }`. Protected endpoints accept `Authorization: Bearer <access-token>`. Admin routes require the `ADMIN` role; customer account routes require a signed-in customer. Pagination uses `page` and `limit` and returns `meta` with list data.

## Health and authentication

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/health` or `/api/health` | Public | API and database health |
| POST | `/auth/register` | Public | Register customer (await approval as configured) |
| POST | `/auth/login` | Public | Login; returns access token and sets refresh cookie |
| POST | `/auth/admin/login` | Public | Admin login |
| GET | `/auth/me` | Bearer | Current authenticated user |
| POST | `/auth/refresh` | Refresh cookie | Rotate refresh/access credentials |
| POST | `/auth/logout` | Refresh cookie | Revoke session and clear cookie |
| POST | `/auth/forgot-password` | Public | Request password reset |
| POST | `/auth/reset-password` | Public | Reset with token |

Auth endpoints have an additional rate limit. Refresh cookies are HttpOnly and SameSite Strict, and are Secure in production.

## Catalogue, products, and content

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/catalogue/public/categories/tree` | Public | Published category tree |
| GET | `/catalogue/public/brands` | Public | Published brands |
| GET/POST/PATCH/DELETE | `/catalogue/admin/categories` | Admin | Category administration; safe delete blocks assigned categories |
| GET/POST/PATCH/DELETE | `/catalogue/admin/brands` | Admin | Brand administration |
| GET/POST/PATCH/DELETE | `/catalogue/admin/companies` | Admin | Company and private contact administration |
| GET | `/products/public?page=&limit=&search=` | Public | Published product listing |
| GET | `/products/public/:slug` | Public | Published product detail |
| GET/POST/PATCH/DELETE | `/products/admin` | Admin | Product catalogue management |
| POST | `/products/admin/uploads/images` | Admin | Upload validated JPEG, PNG, or WebP images |
| POST | `/products/admin/uploads/documents` | Admin | Upload validated PDF files |
| GET | `/content/public/homepage` | Public | Published CMS homepage data |
| GET | `/content/public/blog` and `/content/public/blog/:slug` | Public | Published sanitized articles |
| POST | `/content/public/contact` | Public | Rate-limited contact enquiry |
| GET/POST/PATCH/DELETE | `/content/admin/blog` | Admin | Blog management |
| GET/PATCH | `/content/admin/enquiries` | Admin | Enquiry review |
| GET/PUT | `/content/admin/homepage`, `/content/admin/settings` | Admin | CMS sections and site settings |

Product public responses use an allowlisted DTO. Supplier, sourcing, procurement, and internal note fields remain private. Blog content is sanitized on write and public response.

## Customer orders and shipping

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/orders/order-request` | Customer | Submit product/variant quantities, delivery details, notes, optional UUID `idempotencyKey` |
| GET | `/customer/orders` | Customer | List own order requests |
| GET | `/customer/orders/:orderId` | Owner | Get own order and timeline; others receive 404 |
| GET | `/orders/admin` | Admin | Filter orders by status, date, and customer |
| GET | `/orders/admin/:id` | Admin | Full order, customer, source, notification, and status history |
| PATCH | `/orders/admin/:id/status` | Admin | Change status with optional note/confirmed total |
| POST | `/orders/admin/notifications/:id/retry` | Admin | Retry a failed email notification |
| GET | `/shipping/states`, `/shipping/methods` | Public | State and active method reference data |
| GET | `/shipping/estimate?originState=&destinationState=&weightKg=&orderValue=&methodId=` | Public | Shipping estimate and manual confirmation notice |
| GET/POST/PATCH/DELETE | `/shipping/admin/methods`, `/shipping/admin/rules` | Admin | Shipping methods and state-to-state price rules |

Frontend prices and totals are ignored when creating an order. Order estimates are server calculated from catalogue snapshots; quote requests have no estimate. Shipping estimate values are informational and final charges are confirmed manually.

## Admin and customer accounts

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/admin/dashboard` | Admin | Database-backed counts, recent orders, and chart series |
| GET | `/admin/customers` | Admin | Search/filter customers and order counts |
| GET | `/admin/customers/:id` | Admin | Customer detail and order history |
| PATCH | `/admin/customers/:id/status` | Admin | Activate or suspend a customer |
| GET/PATCH | `/customer/me` | Customer | Current profile |
| GET/POST/PATCH/DELETE | `/customer/addresses` | Customer | Own delivery addresses |

Admin customer queries select explicit profile/order fields and never select password hashes.
