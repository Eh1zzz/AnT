import express from 'express';
import cors    from 'cors';
import helmet  from 'helmet';
import morgan  from 'morgan';
import { env }              from './config/env';
import { testConnection }   from './config/db';
import { errorHandler, notFound } from './middleware/errorHandler';
import { logger }           from './utils/logger';
import authRoutes    from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes   from './routes/orderRoutes';

const app = express();

// ── Security & parsing ────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: true }));
// Webhook needs raw body for signature validation — mount before json()
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
if (env.nodeEnv !== 'test') app.use(morgan('dev'));

// ── Routes ────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ status: 'AnT API running', ts: Date.now() }));
app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);

// ── Error handling ────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Boot ──────────────────────────────────────────────────────────
async function boot() {
  await testConnection();
  app.listen(env.port, () => {
    logger.info(`AnT API → http://localhost:${env.port}  [${env.nodeEnv}]`);
  });
}
boot().catch((err) => { logger.error('Boot failed:', err); process.exit(1); });

export default app;
