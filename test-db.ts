import { Sequelize, Table, Column, Model, DataType, Index, Default, PrimaryKey } from 'sequelize-typescript';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:'
});

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id!: string;

  @Index
  @Column({ type: DataType.STRING, field: 'stripe_customer_id' })
  stripeCustomerId?: string;
}

sequelize.addModels([User]);

sequelize.sync({ force: true }).then(() => {
  console.log("SYNC SUCCESS");
}).catch(e => {
  console.error("SYNC ERROR:", e.message);
  console.error(e.sql);
});
