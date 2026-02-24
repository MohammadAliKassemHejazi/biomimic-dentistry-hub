import { Table, Column, Model, DataType, BelongsTo, ForeignKey, Default, PrimaryKey } from 'sequelize-typescript';
import { User } from './User.model';
import { BlogPost } from './BlogPost.model';

@Table({
  tableName: 'blog_views',
  timestamps: true,
  updatedAt: false,
  underscored: true,
})
export class BlogView extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => BlogPost)
  @Column(DataType.UUID)
  blogPostId!: string;

  @BelongsTo(() => BlogPost)
  blogPost!: BlogPost;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId?: string;

  @BelongsTo(() => User)
  user?: User;

  @Column(DataType.STRING)
  ipAddress?: string;
}
