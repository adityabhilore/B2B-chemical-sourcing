# Phase 9: Shipping, Dashboard, Customers

## Implementation checklist

- [x] Admin can create and manage active/inactive shipping methods; delete deactivates methods still referenced by existing orders.
- [x] Shipping Price Master supports origin-to-destination state routes, method, base/per-kg rate, optional weight/order value bounds, free-above value, and priority.
- [x] India state and union territory codes are served as reference data. Active overlapping route/method and condition rules are rejected; referenced rules are safely deactivated on delete.
- [x] Customer order request page can request a shipping estimate and clearly says estimates are provisional and final shipping charges are confirmed manually.
- [x] Admin dashboard counts and recent orders come from the database; charts show the last 30 days of order requests and order status distribution. No visits or revenue are fabricated or displayed.
- [x] Customer management shows name, business, email, phone, registration date, order count, and active/suspended status; account status can be changed.
- [x] Customer detail shows profile contact information and order history. Password fields are never selected or returned.
- [x] Apply database migrations and regenerate Prisma Client (verified 17 October 2026).
- [x] Verify Prisma schema and sequential company/category/brand/product numbers with rollback-only PostgreSQL inserts; no validation rows were retained.
- [ ] Complete the remaining live acceptance walkthrough; record each outcome below.

## Manual acceptance steps

1. Create, edit, deactivate, reactivate, and delete a shipping method. For a method used by an order, verify delete deactivates instead of removing it.
2. Create price rules for different state pairs, methods, weights, and order values. Try to create overlapping active rules, including wildcard state/method rules, and confirm the API rejects them. Deactivate a rule and confirm a replacement can be saved.
3. Request a customer shipping estimate for a matching route and a route without a match. Confirm the estimate disclaimer is visible and the value is labelled provisional; final shipping remains manually confirmed.
4. Compare dashboard product/category/brand/customer/order counts, pending count, recent orders, status chart, and 30-day order chart with the database. Confirm no sample records, visits, or revenue appear.
5. Search and filter customers. Open a customer detail and verify business/contact details and their order list. Suspend the account and confirm that customer's next authenticated request is rejected; reactivate it and confirm access returns.
6. Inspect customer-list and customer-detail API responses to ensure password hashes and other authentication secrets are absent.
