const {  DataTypes } = require('sequelize');
const sequelize =require('../sequelizeInstance/sequelizeinstance');
const Disease = require('./disease');

const MappedTable = sequelize.define('Mapping', {
  diseaseid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Disease',
      key: 'diseaseId'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  symptomid: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Symptom',
      key: 'symptomId'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  }
}, {
  tableName: 'mappings',
  timestamps: false,
  indexes: [
    {
      name: 'symptom_id_idx',
      using: 'BTREE',
      fields: ['diseaseid']
    },
    {
      name: 'symptom_id',
      using: 'BTREE',
      fields: ['symptomid']
    }
  ]
});

module.exports = MappedTable;
