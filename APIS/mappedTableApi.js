const exp = require("express");
const mappedTableApp = exp.Router();
mappedTableApp.use(exp.json());
const mysql = require("mysql2/promise");
const db = require('../config').db;
const Diseases = require('../Models/disease');
const Symptom = require("../Models/symptom");


// The endpoint is defined with the async function
mappedTableApp.post("/create-disease", async (req, res) => {
    try {
      console.log(req.body)
      const { diseaseName, symptom } = req.body
 
       const newDisease = await Diseases.create({
        diseaseName:diseaseName
      });
      // Retrieve the user object from the request body
      let diseaseId =newDisease.dataValues.diseaseId;
    
      // Attempt to connect to the MySQL database
      let connection = await mysql.createConnection(db);
      
      // Loop through all the symptoms in the user object and insert them into the database
      for (let i = 0; i < symptom.length; i++) {
        sql ="INSERT INTO mappings( diseaseid,symptomid) VALUES (?,?)";
        values = [diseaseId, symptom[i]];
        await connection.query(sql, values);
      }
      // Close the database connection
      await connection.end();
      // Send a 200 status with the success message
      res.status(200).send({message:"Insertion Successful"});
    } catch (err) {
      console.log(err)
      return res.status(500).send({message:err.message});
    }
  });
  
  mappedTableApp.put("/edit-mapped-disease", async (req, res) => {
    try {
      
      let diseaseName=req.body.diseaseName
      let isChanged =req.body.isChanged
      let diseaseId=req.body.diseaseId
      if(isChanged)
      {
        const check = await Diseases.findOne({
          where: {
            diseaseName: diseaseName,
          },
        });
    
        if (check !== null)
          return res.status(409).json({ message: "This disease already exists" });
          await Diseases.update(
            { diseaseName: diseaseName },
            { where: { diseaseId: diseaseId } }
          );
      }
      // Retrieve the user object from the request body
      let userObj = req.body;
      console.log(userObj)
      // Extract the symptoms from the user object and store in a variable
      let a = userObj.symptoms;
      // Declare a variable for storing duplicate disease id
      let duplicate;
      // Attempt to connect to the MySQL database
      let connection = await mysql.createConnection(db);
      // Create a SQL query for retrieving all the existing diseases and their symptoms from the database
      let sql = `SELECT diseaseid,JSON_ARRAYAGG(symptomid) as symptom_ids FROM mappings group by diseaseid;`;
      // Execute the SQL query and retrieve the result
      const [objects] = await connection.execute(sql);
      // Check if the disease with the same symptoms already exists in the database
      console.log(objects)
      const isEqual = objects.some((obj) => {
        // If the number of symptoms is not equal to the number of symptoms in the user object, return false
        if (obj.symptom_ids.length !== a.length) {
          return false;
        }
        // Loop through all the symptoms in the database
        for (let i = 0; i < obj.symptom_ids.length; i++) {
          // If the symptom in the database is not the same as the symptom in the user object, return false
          if (obj.symptom_ids[i] !== a[i]) {
            return false;
          }
        }
        // If the disease with the same symptoms is found, store its ID in the duplicate variable and return true
        duplicate = obj.diseaseid;
        return true;
      });
      // If the disease with the same symptoms already exists in the database, return a 409 conflict status with the duplicate disease id
      if (isEqual) {
        return res
          .status(409)
          .send({message: `with same symptoms diasease found: ${duplicate}` });
      }
  
      sql=`DELETE FROM mappings WHERE diseaseid = ${userObj.diseaseId}`
         await connection.query(sql);
  
      

      // Loop through all the symptoms in the user object and insert them into the database
      for (let i = 0; i < userObj.symptoms.length; i++) {
        sql ="INSERT INTO mappings( diseaseid,symptomid) VALUES (?,?)";
           values = [userObj.diseaseId, userObj.symptoms[i]];
           await connection.query(sql, values);
      }
      // await Diseases.destroy({ where: { diseaseId: disease_id } });
      // Close the database connection
      await connection.end();
      // Send a 200 status with the success message
      res.status(200).send({message:"Updated successfully"});
    } catch (err) {
      // If there is an error, log the error and send a 500 internal server error status
      console.error(err.message);
      return res.status(500).send({message:err.message});
    }
  });

  mappedTableApp.get("/disease-symptoms", async (req, res) => {
    try {
      // Attempt to connect to the MySQL database
      let connection = await mysql.createConnection(db);
      // Create a SQL query for retrieving all the existing diseases and their symptoms from the database
      let sql = `SELECT d.diseaseId, d.diseaseName, s.symptomId, s.symptomName
        FROM mappings m
        JOIN diseases d ON d.diseaseId = m.diseaseid
        JOIN symptoms s ON s.symptomId = m.symptomid`;
  
      // Execute the SQL query and retrieve the result
      const [results] = await connection.execute(sql);
  
      const data = {};
  
      for (const result of results) {
        const diseaseId = result.diseaseId;
        const diseaseName = result.diseaseName;
        const symptomId = result.symptomId;
        const symptomName = result.symptomName;
  
        if (!data[diseaseId]) {
          data[diseaseId] = {
            diseaseName,
            symptoms: [],
          };
        }
  
        data[diseaseId].symptoms.push({ symptomId, symptomName });
      }
  
      const dataArray = Object.entries(data).map(([diseaseId, { diseaseName, symptoms }]) => ({
        diseaseId,
        diseaseName,
        symptoms,
      }));
  
      // Send a 200 status with the success message
      res.status(200).send(dataArray);
    } catch (err) {
      // If there is an error, log the error and send a 500 internal server error status
      console.log(err);
      return res.status(500).send({ message: err.message });
    }
  });
  


  module.exports=mappedTableApp