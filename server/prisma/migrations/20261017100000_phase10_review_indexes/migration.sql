CREATE INDEX "users_role_createdAt_idx" ON "users"("role", "createdAt");
CREATE INDEX "order_requests_createdAt_status_idx" ON "order_requests"("createdAt", "status");
CREATE INDEX "shipping_rules_originState_destinationState_methodId_isActive_idx" ON "shipping_rules"("originState", "destinationState", "methodId", "isActive");
