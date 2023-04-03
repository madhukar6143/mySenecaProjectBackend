const exp = require("express");
const userApp = exp.Router();
userApp.use(exp.json());
const jwt = require("jsonwebtoken")
const mysql = require("mysql2/promise");
const db = require('../config').db;
const User =require('../Models/user')
const validateCredentials = require('../Modules/joi')
const bcryptjs=require("bcryptjs")
  
userApp.post("/signup", async (req, res) => {
  try {
    // Retrieve the user object from the request body
    input =
    {
      name:req.body.name,
      userName: req.body.userName,
      password: req.body.password,
      email: req.body.email,
      gender:req.body.gender,
      mobileNumber:req.body.mobileNumber
    }
    console.log(input)
    const userValidation = await validateCredentials(req.body.userName,req.body.password);
    if (userValidation)
      return  res.status(401).send({ message: `validation error: ${userValidation}` });

       const usermail =  await User.findOne({ where: { email : req.body.email } }) 

      if(usermail){
          return res.status(409).send({message : 'email already exists...'});
      }
      
      const mobile =  await User.findOne({ where: { mobileNumber : req.body.mobileNumber } }) 

      if(mobile){
          return res.status(409).send({message : 'Mobile number already exists...'});
      }
      const user =  await User.findOne({ where: { userName : req.body.userName } }) 

      if(user){
          return res.status(409).send({message : 'username already exists...'});
      }

      let hashedpassword =await bcryptjs.hash(input.password,6)
      input.password=hashedpassword;
    // Attempt to connect to the MySQL database

     await User.create(input);
    // Send a 200 status with the success message
    return res.status(200).send({message:"Registration Successful"});
  } catch (err) {
    
    return res.status(500).send({message:"Internal server error"})
  }
});



  
userApp.post("/login", async (req, res) => {
      try {
        console.log(req.body.email)
        const user = await User.findOne({
          where: {
            email:req.body.email
          },
        });
        if (user === null) {
       return res.status(400).json({ message: "Invalid username" })
      }
      let result = await bcryptjs.compare(req.body.password, user.password)
      //if not matched
      if (result === false) {
        return res.status(400).json({message:"Invalid password"})
        // Send a 200 status with the success message
      }
      
      
      let tokened = jwt.sign({ userName: user.userName }, 'mysecretkey', { expiresIn: 1000 })
    
      return res.status(200).json({ message: "Login successful", token: tokened ,user:user})
    } catch (err) {
      return res.status(500).send(err.message);
    }
  });


userApp.post("/change-password", async (req, res) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!user) {
      return res.status(404).send("User not found");
    }
    if(req.body.password!==user.password)
    return res.status(400).json({message:"Invalid password"})



    // Save the OTP and expiry time in the database
    await User.update(
      {
        otp: otp
      },
      {
        where: {
          id: user.id,
        },
      }
    );

    res.send("OTP sent to your email");
  } catch (err) {
    return res.status(500).send(err.message);
  }
});


  module.exports=userApp;