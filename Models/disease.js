const { DataTypes } = require('sequelize');
const sequelize =require('../sequelizeInstance/sequelizeinstance')


const Disease = sequelize.define('Disease', {
  diseaseId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  diseaseName: {
    type: DataTypes.STRING(45),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'diseases',
  timestamps: false
});

module.exports = Disease;
