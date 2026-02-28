import { Table, Column, Model, DataType, Default, PrimaryKey, Unique } from 'sequelize-typescript';

@Table({
  tableName: 'subscription_plans',
  timestamps: true,
  underscored: true,
})
export class SubscriptionPlan extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @Column(DataType.STRING)
  key!: string; // 'basic', 'vip', 'ambassador'

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.DECIMAL(10, 2))
  price!: number;

  @Column(DataType.STRING)
  interval!: string; // 'month', 'year'

  @Column(DataType.JSON)
  features!: string[];

  @Default(false)
  @Column(DataType.BOOLEAN)
  popular!: boolean;

  @Column(DataType.STRING)
  stripePriceId!: string;

  @Column(DataType.STRING)
  icon!: string; // 'Trophy', 'Star', 'Crown'
}
