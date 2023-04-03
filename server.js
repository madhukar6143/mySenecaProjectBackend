const exp = require("express");
const app = exp();
const symptomApp = require("./APIS/symptomApi");
const diseaseApp = require("./APIS/diseaseApi")
const mappedTableApp=require("./APIS/mappedTableApi")
const searchApp = require('./APIS/searchApi')
const cors = require('cors');
const userApp = require("./APIS/users");
const authMiddleware=require('./Modules/authMiddleware')
const corsOptions ={
    origin:["http://localhost:3000","https://disease-prediction-seneca-project.netlify.app"], 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions))



app.use("/symptomApp", authMiddleware,symptomApp)
app.use("/diseaseApp", authMiddleware,diseaseApp)
app.use("/mappedtable", authMiddleware,mappedTableApp) 
app.use("/search", authMiddleware,searchApp)
app.use("/user",userApp)
//homepage
app.get("/", function (req, res) {
  res.send("Home Page");
});

const port = 5000;
app.listen(port, () => console.log(`Server can hear you on ${port}....`));