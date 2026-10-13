import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { prisma } from './lib/prisma.js';
import authRouter from './modules/auth/auth.router.js';
import customerRouter from './modules/customer/customer.router.js';
import adminRouter from './modules/admin/admin.router.js';
import catalogueRouter from './modules/catalogue/catalogue.router.js';
import productsRouter from './modules/products/products.router.js';
import contentRouter from './modules/content/content.router.js';
import ordersRouter from './modules/orders/orders.router.js';
import shippingRouter from './modules/shipping/shipping.router.js';
import { requestLogger } from './middleware/requestLogger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { successResponse, errorResponse } from './utils/apiResponse.js';

const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(requestLogger);
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 500, skip: () => config.isDev, standardHeaders: true, legacyHeaders: false }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

async function health(_req, res) {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json(successResponse({ status: 'ok', database: 'connected', timestamp: new Date().toISOString(), environment: config.env }, 'API and database are healthy'));
  } catch {
    return res.status(503).json(errorResponse('API is running but the database is unavailable', { database: 'disconnected' }));
  }
}

app.get('/health', health);
app.get('/api/health', health);
app.use('/api/auth', authRouter);
app.use('/api/customer', customerRouter);
app.use('/api/admin', adminRouter);
app.use('/api/catalogue', catalogueRouter);
app.use('/api/products', productsRouter);
app.use('/api/content', contentRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/shipping', shippingRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
