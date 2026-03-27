import { Table, Column, Model, DataType, BelongsTo, ForeignKey, Default, PrimaryKey, } from 'sequelize-typescript';
import { User } from './User.model';
import { AccessLevel, ContentStatus } from '../types/enums';

@Table({
  tableName: 'resources',
  timestamps: true,
  underscored: true,
  indexes: [
    { name: 'resources_access_level', fields: ['access_level'] },
    { name: 'resources_category', fields: ['category'] },
    { name: 'resources_status', fields: ['status'] },
    { name: 'resources_created_by_id', fields: ['created_by_id'] }
  ],
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

  @Default(AccessLevel.PUBLIC)
  @Column(DataType.ENUM(...Object.values(AccessLevel)))
  accessLevel!: AccessLevel;

  @Column(DataType.STRING)
  category?: string;

  @Column(DataType.TEXT) // SQLite stores strings, but CSV string is TEXT
  tags!: string;

  @Default(0)
  @Column(DataType.INTEGER)
  downloadCount!: number;

  @Default(ContentStatus.APPROVED)
  @Column(DataType.ENUM(...Object.values(ContentStatus)))
  status!: ContentStatus;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  createdById?: string;

  @BelongsTo(() => User)
  createdBy?: User;
}
