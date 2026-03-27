import { Table, Column, Model, DataType, BelongsTo, ForeignKey, Default, PrimaryKey, } from 'sequelize-typescript';
import { User } from './User.model';
import { Course } from './Course.model';
import { PurchaseStatus } from '../types/enums';

@Table({
  tableName: 'purchases',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'course_id'],
    },
    { name: 'purchases_user_id', fields: ['user_id'] },
    { name: 'purchases_course_id', fields: ['course_id'] },
    { name: 'purchases_status', fields: ['status'] }
  ],
})
export class Purchase extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => Course)
  @Column(DataType.UUID)
  courseId!: string;

  @BelongsTo(() => Course)
  course!: Course;

  @Column(DataType.STRING)
  stripePaymentIntentId?: string;

  @Column(DataType.DECIMAL)
  amount!: number;

  @Default(PurchaseStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(PurchaseStatus)))
  status!: PurchaseStatus;
}
