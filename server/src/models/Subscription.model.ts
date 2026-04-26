import { Table, Column, Model, DataType, BelongsTo, ForeignKey, Default, PrimaryKey, Unique, } from 'sequelize-typescript';
import { User } from './User.model';
import { SubscriptionStatus } from '../types/enums';

@Table({
  tableName: 'subscriptions',
  timestamps: true,
  underscored: true,
  indexes: [
    { name: 'subscriptions_user_id', fields: ['user_id'] },
    { name: 'subscriptions_stripe_subscription_id', fields: ['stripe_subscription_id'] },
    // SV-06 (Iter 8): Added PayPal subscription ID index for webhook lookups
    { name: 'subscriptions_paypal_subscription_id', fields: ['paypal_subscription_id'] },
    { name: 'subscriptions_status', fields: ['status'] }
  ],
})
export class Subscription extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Unique
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @Unique
  @Column(DataType.STRING)
  stripeSubscriptionId!: string;

  @Column(DataType.STRING)
  stripePriceId!: string;

  // SV-06 (Iter 8): PayPal subscription ID for webhook handler lookups.
  // sequelize.sync({ alter: true }) will ADD this column on next server start.
  // Format: "I-XXXXXXXXXXXXXXXX"
  @Column(DataType.STRING)
  paypalSubscriptionId?: string;

  @Column(DataType.ENUM(...Object.values(SubscriptionStatus)))
  status!: SubscriptionStatus;

  @Column(DataType.DATE)
  currentPeriodEnd!: Date;

  @Default(false)
  @Column(DataType.BOOLEAN)
  cancelAtPeriodEnd!: boolean;
}
