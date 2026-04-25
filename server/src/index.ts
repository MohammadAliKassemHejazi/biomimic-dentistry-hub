import 'reflect-metadata'; // Required for sequelize-typescript
import 'dotenv/config'; // Load env vars before other imports
import express, { Request, Response, NextFunction } from 'express';
import { sequelize } from './config/database';

// Check for required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Error: Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import compression from 'compression';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import resourceRoutes from './routes/resource.routes';
import userRoutes from './routes/user.routes';
import blogRoutes from './routes/blog.routes';
import subscriptionRoutes from './routes/subscription.routes';
import contactRoutes from './routes/contact.routes';
import ambassadorRoutes from './routes/ambassador.routes';
import adminRoutes from './routes/admin.routes';
import trustedPartnerRoutes from './routes/trustedPartner.routes';
import leadershipMemberRoutes from './routes/leadershipMember.routes';
import subscriptionPlanRoutes from './routes/subscriptionPlan.routes';
import partnershipRoutes from './routes/partnership.routes';
import newsletterRoutes from './routes/newsletter.routes';
// SV-16 (Iter 3): webhook routes (Stripe + PayPal)
import webhookRoutes from './routes/webhook.routes';
import { seedDefaultAdmin } from './utils/seed';
import { publicCacheHeaders } from './middleware/cache';

const app = express();
const port = process.env.PORT || 5000;

// SV-17: trust the first proxy (Render/ingress) so req.ip is accurate for dedupe/rate-limit.
app.set('trust proxy', 1);

// P-B8 (Iter 2): minimal request-timing logger. Writes a single line per
// completed request with method, path, status, and duration in ms.
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;
    // eslint-disable-next-line no-console
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(1)}ms`
    );
  });
  next();
});

app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// SV-16 (Iter 3): CRITICAL — register webhook routes BEFORE express.json().
// Stripe and PayPal require the raw request body for signature verification.
// The global json middleware would consume and parse the body before our
// route-level express.raw() handlers get a chance to see it, causing
// stripe.webhooks.constructEvent() to throw a 400 signature error.
app.use('/api/webhooks', webhookRoutes);

// SV-18: explicit body limit. Blog content may be large; pick 1MB.
app.use(express.json({ limit: '1mb' }));

// P-B5 (Iter 2): user uploads are content-addressed (multer random names) so
// they can be cached aggressively and served immutable.
app.use(
  '/uploads',
  express.static(path.join(__dirname, '../public/uploads'), {
    maxAge: '30d',
    immutable: true,
    etag: true,
  })
);

// SV-02: Database connection — exit hard on failure so Render/Docker restarts cleanly.
sequelize.authenticate()
  .then(async () => {
    console.log('Database connected via Sequelize');
    // Sync schema in development, or in production when SYNC_DB=true (first deploy only)
    if (process.env.NODE_ENV !== 'production' || process.env.SYNC_DB === 'true') {
      await sequelize.sync({ alter: true });
      console.log('Database synced');
    }
    await seedDefaultAdmin();
  })
  .catch((err: any) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  });

// P-B3 (Iter 2): apply HTTP Cache-Control for public, frequently-read routes.
const publicCache = publicCacheHeaders();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', publicCache, courseRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ambassadors', ambassadorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partners', publicCache, trustedPartnerRoutes);
app.use('/api/leadership', publicCache, leadershipMemberRoutes);
app.use('/api/plans', publicCache, subscriptionPlanRoutes);
app.use('/api/partnership', partnershipRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// SV-04: Global error handler. Contract: { message: string } (frozen by architect).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  const status = typeof err?.status === 'number' ? err.status : 500;
  const message = process.env.NODE_ENV === 'production'
    ? (status < 500 ? (err?.message || 'Request failed') : 'Internal server error')
    : (err?.message || 'Internal server error');
  res.status(status).json({ message });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
