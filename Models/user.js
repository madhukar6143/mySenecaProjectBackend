const { DataTypes } = require('sequelize');
const sequelize =require('../sequelizeInstance/sequelizeinstance');

const User = sequelize.define('user', {
  userName: {
    type: DataTypes.STRING(45),
    allowNull: false,
    primaryKey: true,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(45),
    allowNull: false,
    unique: true,
  },
  role: {
    type: DataTypes.ENUM('admin', 'user'),
    allowNull: false,
    defaultValue: 'user',
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(45),
    allowNull: false,
  },
  mobileNumber: {
    type: DataTypes.STRING(10),
    allowNull: false,
    unique: true,
    validate: {
      is: /^\d{10}$/i,
    },
  },
}, {
  timestamps: false,
  tableName: 'users',
});


module.exports = User;
