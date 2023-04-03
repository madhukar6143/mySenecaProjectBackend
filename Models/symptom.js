const {  DataTypes } = require('sequelize');
const sequelize =require('../sequelizeInstance/sequelizeinstance')

const Symptom = sequelize.define('Symptom', {
  symptomId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  symptomName: {
    type: DataTypes.STRING(45),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'symptoms',
  timestamps: false
});

module.exports = Symptom;
