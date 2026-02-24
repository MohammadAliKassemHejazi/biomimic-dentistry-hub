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
  ],
  logging: false, // Set to console.log to see SQL queries
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false
  }
});
