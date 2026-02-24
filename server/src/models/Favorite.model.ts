import { Table, Column, Model, DataType, BelongsTo, ForeignKey, Default, PrimaryKey } from 'sequelize-typescript';
import { User } from './User.model';
import { BlogPost } from './BlogPost.model';

@Table({
  tableName: 'favorites',
  timestamps: true, // Prisma: createdAt, no updatedAt in schema?
  // Schema: createdAt @default(now())
  updatedAt: false,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'blog_post_id'],
    },
  ],
})
export class Favorite extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId!: string;

  @BelongsTo(() => User)
  user!: User;

  @ForeignKey(() => BlogPost)
  @Column(DataType.UUID)
  blogPostId!: string;

  @BelongsTo(() => BlogPost)
  blogPost!: BlogPost;
}
