const { Sequelize, DataTypes } = require('sequelize');
const { Table, Column, Model, DataType, Index, Default, PrimaryKey } = require('sequelize-typescript');

const sequelize = new Sequelize('sqlite::memory:');

@Table({
  tableName: 'users',
  timestamps: true,
  underscored: true,
})
class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id;

  @Index
  @Column({ type: DataType.STRING, field: 'stripe_customer_id' })
  stripeCustomerId;
}

sequelize.addModels([User]);

sequelize.sync({ force: true }).then(() => {
  console.log("SYNC SUCCESS");
}).catch(e => {
  console.error("SYNC ERROR:", e.message);
  console.error(e.sql);
});
