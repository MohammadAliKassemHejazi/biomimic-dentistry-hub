import { Table, Column, Model, DataType, Default, PrimaryKey } from 'sequelize-typescript';
import { ContactStatus } from '../types/enums';

@Table({
  tableName: 'contact_messages',
  timestamps: true,
  updatedAt: false,
  underscored: true,
})
export class ContactMessage extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  subject!: string;

  @Column(DataType.TEXT)
  message!: string;

  @Default(ContactStatus.NEW)
  @Column(DataType.ENUM(...Object.values(ContactStatus)))
  status!: ContactStatus;
}
