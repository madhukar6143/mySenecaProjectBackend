const exp = require("express");
const symptomApp = exp.Router();
symptomApp.use(exp.json());
const Symptom = require("../Models/symptom");
const mysql = require("mysql2/promise");
const db = require("../config").db;

symptomApp.get("/get-symptoms", async (req, res) => {
  try {
    const symptomArray = await Symptom.findAll({
      order: [["symptomId", "ASC"]],
    });
    const result = symptomArray.map((symptom) => symptom.dataValues);
    res.status(200).send(result);
  } catch (err) {
    // If there is an error, log the error and send a 500 internal server error status
    return res.status(500).send({ message: err.message });
  }
});

// Set up a POST route to create a new symptom master in the database
symptomApp.post("/create-symptom-master", async (req, res) => {
  try {
    let input = {
      symptomName: req.body.symptomName
    };
    const check = await Symptom.findOne({
      where: input,
    });
    if (check !== null)
      return res.status(409).json({ message: "The symptom already exists" });
    // Retrieve the user object from the request body
    await Symptom.create(input);
    // Send a 200 status with the success message
    res.status(200).send({ message: "Symptom created Successful" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

symptomApp.put("/update-symptom-master", async (req, res) => {
  try {
    // Retrieve the user object from the request body
    let dataObj = req.body;
    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection(db);
    // Create a SQL query for updating the symptom name in the database
    let sql = `UPDATE symptoms SET symptomName = "${dataObj.symptomName}" WHERE symptomId = ${dataObj.symptom_id}`;
    // Execute the SQL query
    await connection.execute(sql);
    // Close the database connection
    await connection.end();
    // Send a 200 status with the success message
    res.status(200).send({ message: "Symptom Name Updated Successful" });
  } catch (err) {
    // If there is an error, log the error and send a 500 internal server error status
    if (err.code === "ER_DUP_ENTRY") {
      // Send a 409 status with the conflict message
      return res
        .status(409)
        .json({ message: "same symptom already exists can't update" });
    } else {
      // If it's not a duplicate key violation, log the error and send a 500 internal server error status
      return res.status(500).json({ message: err.message });
    }
  }
});

symptomApp.delete("/delete-symptom-master/:id", async (req, res) => {
  try {
    let symptom_id = parseInt(req.params.id);
    // Retrieve the user object from the request body

    // Attempt to connect to the MySQL database
    let connection = await mysql.createConnection(db);

    // Select all rows from mapped_table and group them by disease_id
    let sql = `SELECT diseaseid,JSON_ARRAYAGG(symptomid) as symptom_ids FROM mappings group by diseaseid order by diseaseid;`;
    const [objects] = await connection.execute(sql);
    // Convert the result to an array of symptom_ids arrays

    let objArr = [];
    for (let i = 0; i < objects.length; i++) {
      objArr.push(objects[i].symptom_ids);
    }

    // Define a function that separates arrays that include a certain element and those that don't
    const separateArrays = (arr, num) => {
      const present = arr.filter((subArr) => subArr.includes(num));
      const remaining = arr.filter((subArr) => !subArr.includes(num));
      return [present, remaining];
    };

    // Use the function to separate arrays that include the symptom to be deleted and those that don't
    const [presentArrays, remainingArrays] = separateArrays(objArr, symptom_id);

    // Define a function that removes a certain element from all arrays in an array of arrays
    const removeElements = (arr, elementToRemove) => {
      return arr.map((subArr) =>
        subArr.filter((element) => element !== elementToRemove)
      );
    };
                     
    // Use the function to remove the symptom to be deleted from all arrays that include it
    const newArr = removeElements(presentArrays, symptom_id);
   
    // Define a function that checks if two arrays of arrays have at least one equal array
    const isEqual = (arr1, arr2) =>
      JSON.stringify(arr1) === JSON.stringify(arr2);

    const hasEqualArray = (a, b) =>
      a.some((arr1) => b.some((arr2) => isEqual(arr1, arr2)));

    // Check if any of the arrays that used to include the symptom to be deleted is now equal to an array in the remaining arrays
    if (hasEqualArray(newArr, remainingArrays))
      return res
        .status(409)
        .json({
          message:
            "Cannot delete this  because it create conflict in diseases symptom combination and make two disease have same symptoms ",
        });

    // If there are no conflicts, delete all rows from mapped_table where disease_id is equal to the symptom to be deleted
    sql = `DELETE FROM symptoms WHERE symptomId = ${symptom_id}`;

    
    await connection.execute(sql);


    sql="Delete from diseases where diseaseId not in (select diseaseid from mappings group by diseaseid);"
    await connection.query(sql);

    return res.status(200).send({ message: "symptom deleted successfully" });
  } catch (err) {
    // If there is an error, log the error and send an error response to the client
    return res.status(500).json({ message: err.message });
  }
});

// Export the Express router
module.exports = symptomApp;
