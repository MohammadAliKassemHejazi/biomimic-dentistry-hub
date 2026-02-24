import { Table, Column, Model, DataType, BelongsTo, ForeignKey, Default, PrimaryKey } from 'sequelize-typescript';
import { User } from './User.model';

@Table({
  tableName: 'activity_logs',
  timestamps: false,
  underscored: true,
})
export class ActivityLog extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  type!: string;

  @Column(DataType.STRING)
  description!: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  timestamp!: Date;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId?: string;

  @BelongsTo(() => User)
  user?: User;

  @Column(DataType.JSON)
  metadata?: any;
}
