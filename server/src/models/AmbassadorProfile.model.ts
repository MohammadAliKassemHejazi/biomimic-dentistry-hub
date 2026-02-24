import { Table, Column, Model, DataType, BelongsTo, ForeignKey, Default, PrimaryKey, Unique } from 'sequelize-typescript';
import { User } from './User.model';

@Table({
  tableName: 'ambassador_profiles',
  timestamps: true,
  underscored: true,
})
export class AmbassadorProfile extends Model {
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

  @Column(DataType.STRING)
  country?: string;

  @Column(DataType.STRING)
  region?: string;

  @Column(DataType.STRING)
  specialization?: string;

  @Column(DataType.TEXT)
  experience?: string;

  @Default(0)
  @Column(DataType.INTEGER)
  students?: number;

  @Column(DataType.STRING)
  flag?: string;

  @Column(DataType.TEXT)
  bio?: string;
}
