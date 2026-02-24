import { Table, Column, Model, DataType, BelongsTo, ForeignKey, Default, PrimaryKey } from 'sequelize-typescript';
import { User } from './User.model';
import { AmbassadorApplicationStatus } from '../types/enums';

@Table({
  tableName: 'ambassador_applications',
  timestamps: true,
  underscored: true,
})
export class AmbassadorApplication extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  country!: string;

  @Column(DataType.TEXT)
  experience?: string;

  @Column(DataType.TEXT)
  bio?: string;

  @Default(AmbassadorApplicationStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(AmbassadorApplicationStatus)))
  status!: AmbassadorApplicationStatus;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId?: string;

  @BelongsTo(() => User)
  user?: User;
}
