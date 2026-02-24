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
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import resourceRoutes from './routes/resource.routes';
import userRoutes from './routes/user.routes';
import blogRoutes from './routes/blog.routes';
import subscriptionRoutes from './routes/subscription.routes';
import contactRoutes from './routes/contact.routes';
import ambassadorRoutes from './routes/ambassador.routes';
import adminRoutes from './routes/admin.routes';
import { seedDefaultAdmin } from './utils/seed';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(helmet());
app.use(express.json());

// Database connection
sequelize.authenticate()
  .then(async () => {
    console.log('Database connected via Sequelize');
    // In development, sync models to update schema if needed
    if (process.env.NODE_ENV !== 'production') {
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

app.get('/', (req: Request, res: Response) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
