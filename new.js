const exp = require("express");
const searchApp = exp.Router();
searchApp.use(exp.json());
const mysql = require("mysql2/promise");
const db = require('../config').db;
const Diseases = require("../Models/disease");

// Define the route and the HTTP method to handle
searchApp.post("/search-disease", async (req, res) => {
  try {
    console.log(req.body)
    // Retrieve the user object from the request body
    let disease_name=req.body.disease_name
    let symptoms=req.body.symptom


    const check = await Diseases.findOne({
      where: {
        disease_name: req.body.disease_name,
      },
    });

    if (check !== null)
      return res.status(409).json({ message: "This disease already exists" });

    // Declare a variable for storing duplicate disease id
    let duplicate;

    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection(db);

    // Create a SQL query for retrieving all the existing diseases and their symptoms from the database
    let sql = `SELECT disease_id,JSON_ARRAYAGG(symptom_ids) as symptom_ids FROM mapped_table group by disease_id;`;

    // Execute the SQL query and retrieve the result
    const [objects] = await connection.execute(sql);

    // Check if the disease with the same symptoms already exists in the database
    const isEqual = objects.some((obj) => {
      // If the number of symptoms is not equal to the number of symptoms in the user object, return false
      if (obj.symptom_ids.length !== symptoms.length) {
        return false;
      }
      // Loop through all the symptoms in the database
      for (let i = 0; i < obj.symptom_ids.length; i++) {
        // If the symptom in the database is not the same as the symptom in the user object, return false
        if (obj.symptom_ids[i] !== symptoms[i]) {
          return false;
        }
      }
      // If the disease with the same symptoms is found, store its ID in the duplicate variable and return true
      duplicate = obj.disease_id;
      return true;
    });

    // If the disease with the same symptoms already exists in the database, return a 200 status with the duplicate disease name
    if (isEqual) {
      let sql = `SELECT disease_name FROM disease where disease_id=${duplicate}`;
      // Execute the SQL query and retrieve the result
      let [result] = await connection.query(sql);
      await connection.end();
      return res.status(409).send({message:`${result[0].disease_name}`});
    }
    // If the disease with the same symptoms is not found, return a 200 status with a message indicating no disease found
   return  res.status(200).send({message:"No disease found with such symptoms"});
  } catch (err) {
    // If there is an error, log the error and send a 200 status with the error message
console.log(console.log(err))
    return res.status(500).send({message:"Internal server error"});
  }
});
// Export the Express router
module.exports = searchApp;