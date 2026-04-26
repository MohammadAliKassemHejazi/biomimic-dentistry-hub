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
import settingsRoutes from './routes/settings.routes';
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
// Public read-only settings (partnership kit URL, etc.) — no auth required
app.use('/api/settings', settingsRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

// BE-DOCKER-01/02: /health is a SYNCHRONOUS handler — no DB query.
// It is mounted BEFORE app.listen() is moved inside the DB chain.
// When /health returns 200, it means app.listen() was called, which only
// happens after DB connect + schema sync + seed (see startup sequence below).
// Docker's healthcheck wget call will get ERR_CONNECTION_REFUSED until
// app.listen() binds port 5000, then immediately get 200 — correct behaviour.
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// ─── DEV-ONLY: database reset endpoint ───────────────────────────────────────
// POST /api/dev/reset  →  drops & recreates all tables, then reseeds admin.
// NEVER available in production.
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/dev/reset', async (req: Request, res: Response) => {
    try {
      console.log('[dev/reset] Dropping and recreating all tables…');
      await sequelize.sync({ force: true });
      console.log('[dev/reset] Tables recreated. Seeding admin…');
      await seedDefaultAdmin();
      console.log('[dev/reset] Done.');
      res.json({
        success: true,
        message: 'Database reset complete. Admin seeded.',
        credentials: {
          email: process.env.SEED_ADMIN_EMAIL || '(SEED_ADMIN_EMAIL not set)',
          password: '(as configured in SEED_ADMIN_PASSWORD env var)',
        },
      });
    } catch (err: any) {
      console.error('[dev/reset] Error:', err);
      res.status(500).json({ success: false, message: err?.message || 'Reset failed' });
    }
  });
}

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

// ─── BE-DOCKER-02: Deferred startup ──────────────────────────────────────────
//
// app.listen() is called INSIDE the database init chain so that port 5000 is
// only bound once the server is fully ready:
//   1. Postgres connection established (sequelize.authenticate)
//   2. Schema up to date (sequelize.sync)
//   3. Seed data present (seedDefaultAdmin)
//   4. Express starts listening → /health returns 200
//
// This makes the Docker health check naturally reflect true readiness.
// Before this fix, app.listen() was called immediately (before DB was ready),
// so port 5000 appeared bound but all DB-dependent routes threw errors during
// the startup window — causing TypeError: Failed to fetch in the browser.
//
// If the DB connection permanently fails (wrong DATABASE_URL), process.exit(1)
// fires and Docker's `restart: unless-stopped` policy retries the container.
// ─────────────────────────────────────────────────────────────────────────────
sequelize.authenticate()
  .then(async () => {
    console.log('Database connected via Sequelize');
    // Sync schema in development, or in production when SYNC_DB=true (first deploy only)
    if (process.env.NODE_ENV !== 'production' || process.env.SYNC_DB === 'true') {
      await sequelize.sync({ alter: true });
      console.log('Database synced');
    }
    await seedDefaultAdmin();

    // Only bind the port AFTER DB is ready — this is the key change.
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err: any) => {
    console.error('Unable to connect to the database:', err);
    // SV-02: exit hard so Docker's restart policy retries the container.
    process.exit(1);
  });
