import { Table, Column, Model, DataType, BelongsTo, ForeignKey, Default, PrimaryKey, Index } from 'sequelize-typescript';
import { User } from './User.model';
import { AccessLevel, ContentStatus } from '../types/enums';

@Table({
  tableName: 'resources',
  timestamps: true,
  underscored: true,
})
export class Resource extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  description?: string;

  @Column(DataType.STRING)
  fileUrl!: string;

  @Column(DataType.STRING)
  fileName!: string;

  @Column(DataType.BIGINT)
  fileSize?: number;

  @Column(DataType.STRING)
  fileType?: string;

  @Index
  @Default(AccessLevel.PUBLIC)
  @Column(DataType.ENUM(...Object.values(AccessLevel)))
  accessLevel!: AccessLevel;

  @Index
  @Column(DataType.STRING)
  category?: string;

  @Column(DataType.TEXT) // SQLite stores strings, but CSV string is TEXT
  tags!: string;

  @Default(0)
  @Column(DataType.INTEGER)
  downloadCount!: number;

  @Index
  @Default(ContentStatus.APPROVED)
  @Column(DataType.ENUM(...Object.values(ContentStatus)))
  status!: ContentStatus;

  @Index
  @ForeignKey(() => User)
  @Column(DataType.UUID)
  createdById?: string;

  @BelongsTo(() => User)
  createdBy?: User;
}
