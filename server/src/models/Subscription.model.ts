import { Table, Column, Model, DataType, BelongsTo, ForeignKey, Default, PrimaryKey, Unique, Index } from 'sequelize-typescript';
import { User } from './User.model';
import { SubscriptionStatus } from '../types/enums';

@Table({
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true,
})
export class Subscription extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Index
  @ForeignKey(() => User)
  @Unique
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Index
  @Unique
  @Column(DataType.STRING)
  stripeSubscriptionId!: string;

  @Column(DataType.STRING)
  stripePriceId!: string;

  @Index
  @Column(DataType.ENUM(...Object.values(SubscriptionStatus)))
  status!: SubscriptionStatus;

  @Column(DataType.DATE)
  currentPeriodEnd!: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  cancelAtPeriodEnd!: boolean;
}
