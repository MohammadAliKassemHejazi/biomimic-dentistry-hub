import 'reflect-metadata'; // Required for sequelize-typescript
import 'dotenv/config'; // Load env vars before other imports
import express, { Request, Response } from 'express';
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
import { seedDefaultAdmin } from './utils/seed';

const app = express();
const port = process.env.PORT || 5000;

app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads'), {
  maxAge: '1d', // Cache static files for 1 day
}));

// Database connection
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
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/ambassadors', ambassadorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/partners', trustedPartnerRoutes);
app.use('/api/leadership', leadershipMemberRoutes);
app.use('/api/plans', subscriptionPlanRoutes);
app.use('/api/partnership', partnershipRoutes);
app.use('/api/newsletter', newsletterRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
