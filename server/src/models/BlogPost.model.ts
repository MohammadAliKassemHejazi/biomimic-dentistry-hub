import { Table, Column, Model, DataType, BelongsTo, HasMany, ForeignKey, Default, PrimaryKey, Unique } from 'sequelize-typescript';
import { User } from './User.model';
import { Favorite } from './Favorite.model';
import { BlogView } from './BlogView.model';
import { ContentStatus } from '../types/enums';

@Table({
  tableName: 'blog_posts',
  timestamps: true,
  underscored: true,
})
export class BlogPost extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  title!: string;

  @Unique
  @Column(DataType.STRING)
  slug!: string;

  @Column(DataType.TEXT)
  excerpt?: string;

  @Column(DataType.TEXT)
  content?: string;

  @Column(DataType.STRING)
  featuredImage?: string;

  @Column(DataType.STRING)
  category?: string;

  @Column(DataType.TEXT)
  tags!: string;

  @Column(DataType.INTEGER)
  readTime?: number;

  @Default(ContentStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(ContentStatus)))
  status!: ContentStatus;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  authorId!: string;

  @BelongsTo(() => User)
  author!: User;

  @HasMany(() => Favorite)
  favorites!: Favorite[];

  @HasMany(() => BlogView)
  views!: BlogView[];
}
