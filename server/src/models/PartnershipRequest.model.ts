import { Table, Column, Model, DataType, BelongsTo, ForeignKey, Default, PrimaryKey } from 'sequelize-typescript';
import { User } from './User.model';
import { PartnershipRequestStatus } from '../types/enums';

@Table({
  tableName: 'partnership_requests',
  timestamps: true,
  underscored: true,
})
export class PartnershipRequest extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  companyName?: string;

  @Column(DataType.TEXT)
  message!: string;

  @Default(PartnershipRequestStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(PartnershipRequestStatus)))
  status!: PartnershipRequestStatus;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId?: string;

  @BelongsTo(() => User)
  user?: User;
}
