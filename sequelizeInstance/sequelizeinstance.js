const { Sequelize } = require('sequelize');


const sequelize = new Sequelize('new_db', 'root', 'madhu', {
  host: 'localhost',
  dialect: 'mysql',
  define: {
    timestamps: false // Disable createdAt and updatedAt columns
  }
});

module.exports = sequelize;


/*

const sequelize = new Sequelize('projectdb', 'root', 'madhu', {
  host: 'localhost',
  dialect: 'mysql',
  define: {
    timestamps: false // Disable createdAt and updatedAt columns
  }
});



const sequelize = new Sequelize('seneca_project', 'madhukar_1522', 'Madhukar@6143', {
  host: 'db4free.net',
  dialect: 'mysql',
  define: {
    timestamps: false // Disable createdAt and updatedAt columns
  }
});
*/