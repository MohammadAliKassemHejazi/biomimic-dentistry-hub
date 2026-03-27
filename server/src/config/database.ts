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
    max: 20,          // Maximum number of connections in pool
    min: 5,           // Minimum number of connections in pool
    acquire: 60000,   // Maximum time, in milliseconds, that pool will try to get connection before throwing error
    idle: 10000       // Maximum time, in milliseconds, that a connection can be idle before being released
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});
