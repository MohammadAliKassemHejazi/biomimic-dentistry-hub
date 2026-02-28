import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';

@Table({
  tableName: 'site_settings',
  timestamps: true,
  underscored: true,
})
export class SiteSetting extends Model {
  @PrimaryKey
  @Column(DataType.STRING)
  key!: string;

  @Column(DataType.TEXT)
  value!: string;
}
