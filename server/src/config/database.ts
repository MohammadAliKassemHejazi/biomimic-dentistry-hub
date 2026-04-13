import { Sequelize } from 'sequelize-typescript';
import {
  User,
  Resource,
  Course,
  Purchase,
  BlogPost,
  Subscription,
  PartnershipRequest,
  ContactMessage,
  AmbassadorProfile,
  AmbassadorApplication,
  ActivityLog,
  Favorite,
  BlogView,
  TrustedPartner,
  LeadershipMember,
  SubscriptionPlan,
  SiteSetting,
} from '../models';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  models: [
    User,
    Resource,
    Course,
    Purchase,
    BlogPost,
    Subscription,
    PartnershipRequest,
    ContactMessage,
    AmbassadorProfile,
    AmbassadorApplication,
    ActivityLog,
    Favorite,
    BlogView,
    TrustedPartner,
    LeadershipMember,
    SubscriptionPlan,
    SiteSetting,
  ],
  logging: false, // Set to console.log to see SQL queries
  pool: {
    // Neon free tier has a small connection limit — keep production pool tight
    max: process.env.NODE_ENV === 'production' ? 5 : 20,
    min: process.env.NODE_ENV === 'production' ? 1 : 5,
    acquire: 60000,
    idle: 10000,
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});
