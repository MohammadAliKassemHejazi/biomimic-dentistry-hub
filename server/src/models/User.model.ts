import { Table, Column, Model, DataType, HasMany, HasOne, Unique, Default, PrimaryKey } from 'sequelize-typescript';
import { Resource } from './Resource.model';
import { Purchase } from './Purchase.model';
import { BlogPost } from './BlogPost.model';
import { Subscription } from './Subscription.model';
import { PartnershipRequest } from './PartnershipRequest.model';
import { AmbassadorProfile } from './AmbassadorProfile.model';
import { ActivityLog } from './ActivityLog.model';
import { Favorite } from './Favorite.model';
import { BlogView } from './BlogView.model';
import { AmbassadorApplication } from './AmbassadorApplication.model';
import { UserRole } from '../types/enums';

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  password!: string;

  @Column(DataType.STRING)
  firstName?: string;

  @Column(DataType.STRING)
  lastName?: string;

  @Default(UserRole.USER)
  @Column(DataType.ENUM(...Object.values(UserRole)))
  role!: UserRole;

  @Column(DataType.STRING)
  avatarUrl?: string;

  @Column(DataType.STRING)
  stripeCustomerId?: string;

  @HasMany(() => Resource)
  resources!: Resource[];

  @HasMany(() => Purchase)
  purchases!: Purchase[];

  @HasMany(() => BlogPost)
  blogPosts!: BlogPost[];

  @HasOne(() => Subscription)
  subscription?: Subscription;

  @HasMany(() => PartnershipRequest)
  partnershipRequests!: PartnershipRequest[];

  @HasOne(() => AmbassadorProfile)
  ambassadorProfile?: AmbassadorProfile;

  @HasMany(() => ActivityLog)
  activityLogs!: ActivityLog[];

  @HasMany(() => Favorite)
  favorites!: Favorite[];

  @HasMany(() => BlogView)
  blogViews!: BlogView[];

  @HasMany(() => AmbassadorApplication)
  ambassadorApplications!: AmbassadorApplication[];
}
