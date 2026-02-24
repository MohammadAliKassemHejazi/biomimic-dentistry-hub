import { Table, Column, Model, DataType, Default, PrimaryKey } from 'sequelize-typescript';

@Table({
  tableName: 'trusted_partners',
  timestamps: true,
  underscored: true,
})
export class TrustedPartner extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  role!: string; // e.g. "Research Partner", "Technology Sponsor"

  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.STRING)
  logo!: string; // URL/Emoji

  @Column(DataType.STRING)
  tier?: string; // Optional: Platinum, Gold, etc.

  @Column(DataType.STRING)
  website?: string;
}
