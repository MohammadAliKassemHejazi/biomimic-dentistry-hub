import { Table, Column, Model, DataType, HasMany, Default, PrimaryKey, Unique, Index } from 'sequelize-typescript';
import { Purchase } from './Purchase.model';
import { AccessLevel } from '../types/enums';

@Table({
  tableName: 'courses',
  timestamps: true,
  underscored: true,
})
export class Course extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  title!: string;

  @Index
  @Unique
  @Column(DataType.STRING)
  slug!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.DECIMAL)
  price!: number;

  @Column(DataType.STRING)
  featuredImage?: string;

  @Index
  @Default(false)
  @Column(DataType.BOOLEAN)
  comingSoon!: boolean;

  @Column(DataType.DATE)
  launchDate?: Date;

  @Index
  @Default(AccessLevel.PUBLIC)
  @Column(DataType.ENUM(...Object.values(AccessLevel)))
  accessLevel!: AccessLevel;

  @Column(DataType.STRING)
  stripePriceId?: string;

  @HasMany(() => Purchase)
  purchases!: Purchase[];
}
