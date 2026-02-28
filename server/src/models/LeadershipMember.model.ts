import { Table, Column, Model, DataType, Default, PrimaryKey } from 'sequelize-typescript';

@Table({
  tableName: 'leadership_members',
  timestamps: true,
  underscored: true,
})
export class LeadershipMember extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  role!: string;

  @Column(DataType.TEXT)
  bio!: string;

  @Column(DataType.STRING)
  image!: string; // URL

  @Column(DataType.STRING)
  linkedin?: string;

  @Column(DataType.STRING)
  twitter?: string;

  @Column(DataType.STRING)
  instagram?: string;

  @Column(DataType.STRING)
  facebook?: string;

  @Column(DataType.STRING)
  expertise?: string;

  @Column(DataType.STRING)
  achievements?: string;

  @Column(DataType.STRING)
  status?: string;
}
