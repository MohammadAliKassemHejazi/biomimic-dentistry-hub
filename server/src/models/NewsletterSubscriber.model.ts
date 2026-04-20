import { Table, Column, Model, DataType, Default, PrimaryKey, Unique } from 'sequelize-typescript';

@Table({
  tableName: 'newsletter_subscribers',
  timestamps: true,
  updatedAt: false,
  underscored: true,
})
export class NewsletterSubscriber extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @Column(DataType.STRING)
  email!: string;
}
