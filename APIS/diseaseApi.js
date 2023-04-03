const exp = require("express");
const diseaseApp = exp.Router();
diseaseApp.use(exp.json());
const Diseases = require("../Models/disease");

// Define the route and the HTTP method to handle
diseaseApp.get("/get-disease-master", async (req, res) => {
  try {
    const Disease = await Diseases.findAll({
      order: [["diseaseId", "ASC"]],
    });
    const result = Disease.map((Disease) => Disease.dataValues);
   return res.status(200).send(result);
  } catch (err) {
    // If there is an error, log the error and send a 500 internal server error status
    return res.status(500).send({ message: err.message });
  }
});

diseaseApp.post("/search-disease", async (req, res) => {
  try {
  
    const check = await Diseases.findOne({
      where: {
        diseaseName: req.body.diseaseName,
      },
    });

    if (check !== null)
      return res.status(409).json({ message: "This disease already exists" });

    // Send a 200 status with the success message
    res.status(200).send({ message: req.body.diseaseName });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

diseaseApp.put("/update-disease-master", async (req, res) => {
  try {
    // Retrieve the user object from the request body
    const { disease_id, disease_name } = req.body;
    await Diseases.update(
      { diseaseName: disease_name },
      { where: { diseaseId: disease_id } }
    );
    return res.status(200).send({ message: "Disease update Successful" });
  } catch (err) {
    // If there is an error, check if it is a duplicate key violation
    if (err.parent.code === "ER_DUP_ENTRY") {
      // Send a 409 status with the conflict message
      return res
        .status(409)
        .json({ message: "disease already exists can't update" });
    } else {
      // If it's not a duplicate key violation, log the error and send a 500 internal server error status
      return res.status(500).json({ message: err.message });
    }
  }
});

diseaseApp.delete("/delete-disease-master/:id", async (req, res) => {
  try {
    // Retrieve the ID of the disease to delete from the URL parameter
    let disease_id = req.params.id;
    // Attempt to connect to the MySQL database
    await Diseases.destroy({ where: { diseaseId: disease_id } });
    // Send a 200 status with the success message
    return res.status(200).send({ message: "Disease Deleted Successful" });
  } catch (err) {
    // If there is an error, log the error and send a 500 internal server error status
    return res.status(500).send({ message: err.message });
  }
});

module.exports = diseaseApp;
