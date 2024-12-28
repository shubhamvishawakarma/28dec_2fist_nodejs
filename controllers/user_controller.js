/*.........import models............*/
const User = require("../models/user_models");
const Category=require("../models/category_models");
const Support = require("../models/contactus_models");
const AboutUs=require("../models/aboutus_models");
const Coordinator = require("../models/coordinator_models");
const Match=require("../models/matches_models");
const Comission=require("../models/comission_models");
const Transjection=require("../models/transjection_models");
const Bets=require("../models/bets_models.js");
const Withdraw=require("../models/withdraw_models.js");
const Live=require("../models/live_models");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const admin = require('firebase-admin');
const serviceAccount = require("../2_fistadminjsom.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});





/*............import dependancies................*/
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();
const moment = require('moment-timezone');


/*.................make function and user it........*/
function unique_user() {
  const OTP = Math.floor(100000 + Math.random() * 900000);
  return OTP;
}


function generate_udi(){
  const randomNumber=Math.floor(10000 + Math.random() * 90000);
  return randomNumber
}

function generateRandomString() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const length = 8;
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(index);
  }

  return randomString;
}

function generateTransjectionNumber() {
  const characters = "0123456789";
  const length = 10;
  let randomString = "";

  for (let i = 0; i < length; i++) {
    const index = Math.floor(Math.random() * characters.length);
    randomString += characters.charAt(index);
  }

  return randomString;
}


function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}


// fare base function
const sendNotification = async (fcmToken, messagePayload) => {
  try {
      const options = {
          priority: 'high',
          timeToLive: 60 * 60 * 24 // 1 day
      };

      const response = await admin.messaging().send({
          token: fcmToken,  // Use send() instead of sendMulticast if targeting a single device
          notification: messagePayload.notification,
          data: messagePayload.data,
      }, false);

      console.log('Successfully sent message:', response);
  } catch (error) {
      console.error('Error sending message:', error);
  }
};





const userSignupApi = async (req, res) => {
  try {
    const {
      userName,
      email,
      password,
      conformPassword,
      fcmId,
      countryName,
    } = req.body;

    // Validate required parameters
    if (
      !userName ||
      !countryName ||
      !email ||
      !password ||
      !conformPassword ||
      !fcmId
    ) {
      return res.status(400).json({
        result: "false",
        message:
          "Required parameters are userName, email, countryName, password, conformPassword, fcmId.",
      });
    }

    // Check if the user already exists
    const exist_user = await User.findOne({ email });
    if (exist_user) {
      return res
        .status(400)
        .json({ result: "false", message: "User already exists." });
    }

    // Validate passwords match
    if (password !== conformPassword) {
      return res
        .status(400)
        .json({ result: "false", message: "Passwords do not match." });
    }

    // Hash the password
    const hashedPasswords = await bcrypt.hash(password, 10);

    // Generate a unique userName
    const name = unique_user(); // Assume this function exists and returns a unique identifier
    const uniqueName = `${userName}${name}`;

    // Create and save the user
    const insertUser = new User({
      userName,
      uniqueName,
      email,
      password: hashedPasswords,
      countryName,
      fcmId,
    });

    const data = await insertUser.save();

    // Send response back to client
    res.status(200).json({
      result: "true",
      message: "User signup successfully",
      data: data,
    });

    // Debugging fcmId
    console.log("FCM ID:", fcmId);

    // Send welcome notification
    const fcmToken = fcmId;
    const messagePayload = {
      notification: {
        title: "Welcome to 2 Fist !!!",
        body: `Dear ${uniqueName}! Welcome to 2 Fist !!! We are here to help you succeed. Your journey to new skills starts today.`,
      },
      data: {
        extraInfo: "Some extra data",
      },
    };

    await sendNotification(fcmToken, messagePayload);
  } catch (err) {
    // Error handling
    res.status(400).json({ result: "false", message: err.message });
    console.error("Error:", err.message);
  }
};





/*................user_login.................*/
const userLoginApi = async (req, res) => {
  try {
    const {email, password, fcmId } = req.body;
    if (!password || !email ){
    return   res.status(400).json({
        result: "false",
        message:
          "required parameters are password and email ,fcmId",
      });
    } 
      const Data = await User.findOne({
       email
      });

      if (!Data) {
        return res
          .status(400)
          .json({ result: "false", message: "You are not register" });
      } 

          // Match password
          const passwordMatch = await bcrypt.compare(
            password,
            Data.password
          );
          //generate token
          const token = jwt.sign(
            {
              userId: Data._id,
              email: Data.email,
              uniqueName: Data.uniqueName,
            },
            process.env.ACCESS_TOKEN_SECURITY,
            { expiresIn: "730d" }
          );
          if (passwordMatch) {
            res.status(200).json({
              result: "true",
              message: "User login successfully",
              data: Data,
              token,
            });
          } else {
            res.status(400).json({
              result: "false",
              message: "Invalid password",
            });
          }
     
  } catch (err) {
    res.status(400).json({ result: "false", message: err.message });
  }
};



/*................ForgotPassword....................*/
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({
      result: "false",
      message:
        "required parameter is email",
    });
  }
  try {
    const data = await User.findOne({
      email
    });
    if (data) {
      res
        .status(200)
        .json({ result: "true", message: "Email matched sucessfully", data:data });
    } else {
      res.status(400).json({
        result: "false",
        message: "Please send correct email",
      });
    }
  } catch (err) {
    res.status(400).json({ result: "false", message: err.message });
  }
};



// resetPassword
const resetPassword = async (req, res) => {
  const {email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      result: "false",
      message: "required parameter are password, email",
    });
  }
  try {
    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.findOneAndUpdate(
      {email},
      { $set: { password: hashedPassword } },
      { new: true }
    );
    res
      .status(200)
      .json({ result: "true", message: "Password reset sucessfully" });
  } catch (err) {
    console.log(err.mesage);
  }
};



/*...................update userProfile............*/
const updateUser_profile = async (req, res) => {
  try {
    const { userName, countryName, phone, dob, gender, userId } = req.body;
    const userProfile = req.file ? req.file.filename : null;

    // Check if userId is provided
    if (!userId) {
      return res.status(400).json({
        result: "false",
        message: "required parameter is userId, and optional parameters are userName, countryName, phone, dob, gender, userProfile",
      });
    }

    // Check if the user exists
    const matchData = await User.findById({_id:userId});
    if (!matchData) {
      return res.status(404).json({
        result: "false",
        message: "User does not exist",
      });
    }

    // Build update data object based on whether a profile image is uploaded
    let updateData = {
      userName,
      countryName,
      phone,
      dob,
      gender,
    };
    if (userProfile) {
      updateData.userProfile = userProfile;
    }

    // Update the user profile
    const updatedUser = await User.findByIdAndUpdate({_id:userId}, updateData, { new: true });

    if (!updatedUser) {
      return res.status(500).json({
        result: "false",
        message: "Failed to update user",
      });
    }

    res.status(200).json({
      result: "true",
      message: "User data updated successfully",
      data: updatedUser,  // Return the updated user data for confirmation
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      result: "false",
      message: "An error occurred while updating the user profile",
    });
  }
};




/*................getUser_profile................*/
const getUser_profile = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
     return res
        .status(400)
        .json({ result: "false", message: "required parameter userId" });
    }
      const matchData = await User.findOne({ _id: userId });
      if(!matchData){
        return res
        .status(400)
        .json({ result: "false", message: "Record not found" });
      }
     
        res.status(200).json({
          result: "true",
          message: "user profile data are",
          path:process.env.image_url,
          data: [matchData],
        });
    
  } catch (err) {
    res.status(400).json({ result: "false", message: err.message });
  }
};




const category_list=async(req,res)=>{
  try{
    const category=await Category.find({acrtive_status:0});
    if(!category){
      return res.status(400).json({result:"false",mesage:"Category does not found"})
      }
      res.status(200).json({result:"true",message:"Category list got sucessfully",data:category})

  
  }catch(err){
    res.status(400).json({ result: "false", message: err.message });
  }

};


const support_list=async(req,res)=>{
  try{
    const support = await Support.find({});
    if(!support){
      return res.status(400).json({result:"false",mesage:"support data  does not found"})
      }
      res.status(200).json({result:"true",message:"support list got sucessfully",data:support})

  
  }catch(err){
    res.status(400).json({ result: "false", message: err.message });
  }

};



const aboutus_list=async(req,res)=>{
  try{
    const aboutus = await AboutUs.find({});
    if(!aboutus){
      return res.status(400).json({result:"false",mesage:"aboutus data  does not found"})
      }
      res.status(200).json({result:"true",message:"aboutus list got sucessfully",data:aboutus})

  
  }catch(err){
    res.status(400).json({ result: "false", message: err.message });
  }

};




const addUserAmount=async(req,res)=>{
  try{
    const {userId,amount}=req.body;
    if(!userId || !amount){
      return res.status(400).json({result:"false",message:"requireds fields are userId and amount"})
    }
    const user = await User.findOne({_id:userId});
    if(!user){
      return res.status(400).json({result:"false",mesage:"User not exist"})
      }
      let total_amount=Number(Number(user.userWallet)+Number(amount));
      await User.findOneAndUpdate({_id:userId},{userWallet:total_amount},{new:true})
      let transjectionId=generateTransjectionNumber();
      const transjection=new Transjection({userId,transjectionId,amount,tranjectionType:"Wallet"});
      await transjection.save();
      res.status(200).json({result:"true",message:"Amount added sucessfully"})

  
  }catch(err){
    res.status(400).json({ result: "false", message: err.message });
  }

};



/*.......................coordinator .........................*/

const coordinatorSignupApi = async (req, res) => {
  try {
    const {
      coordinatorName,
      email,
      password,
      conformPassword,
      fcmId,
      countryName,
     
    } = req.body;
   
    if (
      !coordinatorName ||
      !countryName ||
      !email ||
      !password ||
      !conformPassword ||
      !fcmId
    ) {
      return res.status(400).json({
        result: "false",
        message:
          "required parameters are coordinatorName,email,countryName,password,conformPassword,fcmId ",
      });
    }

    const exist_coordinator = await Coordinator.findOne({email});
    if (exist_coordinator) {
      return res
        .status(400)
        .json({ result: "false", message: "Coordinator allready exist" });
    }
    if (password !== conformPassword) {
      return res
        .status(400)
        .json({ result: "false", message: "Passwords do not match." });
    }

    const hashedPasswords = await bcrypt.hash(password, 10);
    const name=unique_user()
    const uniqueName = coordinatorName + name;

    const insertUser=new Coordinator({coordinatorName,uniqueName,email,password:hashedPasswords,countryName,fcmId});
      const data=  await insertUser.save();
        res.status(200).json({
          result: "true",
          message: "Coordinator signup sucessfully",
          data: data,
        });

  } catch (err) {
    res.status(400).json({ result: "false", message: err.message });
    console.log(err.message);
  }
};




/*................user_login.................*/
const coordinatorLoginApi = async (req, res) => {
  try {
    const {email, password, fcmId } = req.body;
    if (!password || !email ){
    return   res.status(400).json({
        result: "false",
        message:
          "required parameters are password and email ,fcmId",
      });
    } 
    const logins = await Coordinator.findOne({email});
    if(!logins){
      return res
          .status(400)
          .json({ result: "false", message: "You are not register" });
    }
      const Data = await Coordinator.findOne({
       email,
       Status:1
      });

      if (!Data) {
        return res
          .status(400)
          .json({ result: "false", message: "You account has not been approve  yet" });
      } 

          // Match password
          const passwordMatch = await bcrypt.compare(
            password,
            Data.password
          );
          //generate token
          const token = jwt.sign(
            {
              CoordinatorId: Data._id,
              email: Data.email,
              uniqueName: Data.uniqueName,
            },
            process.env.ACCESS_TOKEN_SECURITY,
            { expiresIn: "730d" }
          );
          if (passwordMatch) {
            res.status(200).json({
              result: "true",
              message: "Coordinator login successfully",
              data: Data,
              token,
            });
          } else {
            res.status(400).json({
              result: "false",
              message: "Invalid password",
            });
          }
     
  } catch (err) {
    res.status(400).json({ result: "false", message: err.message });
  }
};




/*................ForgotPassword....................*/
const coordinatorForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({
      result: "false",
      message:
        "required parameter is email",
    });
  }
  try {
    const data = await Coordinator.findOne({
      email
    });
    if (data) {
      res
        .status(200)
        .json({ result: "true", message: "Email matched sucessfully", data:data });
    } else {
      res.status(400).json({
        result: "false",
        message: "Please send correct email",
      });
    }
  } catch (err) {
    res.status(400).json({ result: "false", message: err.message });
  }
};



// resetPassword
const coordinatorResetPassword = async (req, res) => {
  const {email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      result: "false",
      message: "required parameter are password, email",
    });
  }
  try {
    // Hash the password before saving it
    const hashedPassword = await bcrypt.hash(password, 10);
    await Coordinator.findOneAndUpdate(
      {email},
      { $set: { password: hashedPassword } },
      { new: true }
    );
    res
      .status(200)
      .json({ result: "true", message: "Password reset sucessfully" });
  } catch (err) {
    console.log(err.mesage);
  }
};






/*...................update userProfile............*/
const updateCoordinatorProfile = async (req, res) => {
  try {
    const { coordinatorName, countryName, phone, dob, gender, coordinatorId } = req.body;
    const coordinatorProfile = req.file ? req.file.filename : null;

    // Check if userId is provided
    if (!coordinatorId) {
      return res.status(400).json({
        result: "false",
        message: "required parameter is coordinatorId, and optional parameters are coordinatorName, countryName, phone, dob, gender, coordinatorProfile",
      });
    }

    // Check if the user exists
    const matchData = await Coordinator.findById({_id:coordinatorId});
    if (!matchData) {
      return res.status(404).json({
        result: "false",
        message: "User does not exist",
      });
    }

    // Build update data object based on whether a profile image is uploaded
    let updateData = {
      coordinatorName,
      countryName,
      phone,
      dob,
      gender,
    };
    if (coordinatorProfile) {
      updateData.coordinatorProfile = coordinatorProfile;
    }

    // Update the user profile
    const updatedUser = await Coordinator.findByIdAndUpdate({_id:coordinatorId}, updateData, { new: true });

    if (!updatedUser) {
      return res.status(500).json({
        result: "false",
        message: "Failed to update user",
      });
    }

    res.status(200).json({
      result: "true",
      message: "Coordinator data updated successfully",
      data: updatedUser,  // Return the updated user data for confirmation
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({
      result: "false",
      message:err.message,
    });
  }
};



/*................getUser_profile................*/
const getCoordinatorProfile = async (req, res) => {
  try {
    const { coordinatorId } = req.body;

    if (!coordinatorId) {
     return res
        .status(400)
        .json({ result: "false", message: "required parameter coordinatorId" });
    }
      const matchData = await Coordinator.findOne({ _id: coordinatorId });
      if(!matchData){
        return res
        .status(400)
        .json({ result: "false", message: "Record not found" });
      }
     
        res.status(200).json({
          result: "true",
          message: "Coordinator profile data are",
          path:process.env.image_url,
          data: [matchData],
        });
    
  } catch (err) {
    res.status(400).json({ result: "false", message: err.message });
  }
};



const createMatch=async(req,res)=>{
  try{
    const {
    categoryId,
    coordinatorId,
    leagueName,
    teamName1,
    teamName2,
    sortName1,
    sortName2,
    start_date,
    expire_date,
    start_time,
    expire_time,
    }=req.body;

    if(!categoryId || !coordinatorId){
      return res.status(400).json({result:"false",message:"Required fields are categoryId,coordinatorId,start_time,expire_time,leagueName,teamName1,teamName2, logo1,logo2,sortName1,sortName2,start_date,expire_date,"})
    }
    const insertMatch=new Match({
      categoryId,
      coordinatorId,
      leagueName,
      teamName1,
      teamName2,
      logo1: req.files['logo1'] ? req.files['logo1'][0].filename : null, // Access the first file for 'logo1'
      logo2: req.files['logo2'] ? req.files['logo2'][0].filename : null,
      sortName1,
      sortName2,
      start_date,
      expire_date,
      start_time,
      expire_time,
    });
    const data=await insertMatch.save();
    res.status(200).json({result:"true",message:"Data inserted sucessfully",data:data})

  }catch(err){
    res.status(400).json({ result: "false", message: err.message });
  }

};




const MatchList=async(req,res)=>{
  try{
    const {
    categoryId,
    currentDate
    }=req.body;

    if(!categoryId || !currentDate){
      return res.status(400).json({result:"false",message:"Required fields are categoryId,currentDate"})
    }

    const Match_list=await Match.find({
      categoryId,
      expire_date:{$gte:currentDate},
    });


if(!Match_list || !Match_list.length>0){
  return  res.status(400).json({result:"false",message:"Record not found"})
}
    res.status(200).json({result:"true",message:"Data inserted sucessfully",data:Match_list})

  }catch(err){
    res.status(400).json({ result: "false", message: err.message });
  }

};




const coordinatorTeamList=async(req,res)=>{
  try{
    const {
    coordinatorId,
    }=req.body;

    if(!coordinatorId ){
      return res.status(400).json({result:"false",message:"Required fields are coordinatorId"})
    }

    const Match_list=await Match.find({
      coordinatorId,
      
    }).populate('categoryId').sort({_id:-1});


if(!Match_list || !Match_list.length>0){
  return  res.status(400).json({result:"false",message:"Record not found"})
}
    res.status(200).json({result:"true",message:"Data inserted sucessfully",data:Match_list})

  }catch(err){
    res.status(400).json({ result: "false", message: err.message });
  }

};



const updateCoordinatorComission=async(req,res)=>{
  try{
    const {
    coordinatorId,comission_percantage
    }=req.body;

    if(!coordinatorId || !comission_percantage){
      return res.status(400).json({result:"false",message:"Required fields are coordinatorId,comission_percantage"})
    }

    await Coordinator.findOneAndUpdate({
      coordinatorId,
      
    },{comission_percantage},{new:true});

    res.status(200).json({result:"true",message:"Comission updated sucessfully"})

  }catch(err){
    res.status(400).json({ result: "false", message: err.message });
  }

};



const coordinatorDashboardCount = async (req, res) => {
  try {
    const { coordinatorId } = req.body;

    if (!coordinatorId) {
      return res.status(400).json({
        result: "false",
        message: "Required fields are coordinatorId",
      });
    }

    const currentDate = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };

    // Get today's and tomorrow's dates in required format
    const formattedDate = currentDate.toLocaleDateString('en-GB', options);
    const tomorrowDate = new Date(currentDate.setDate(currentDate.getDate() + 1))
      .toLocaleDateString('en-GB', options);

    // Using Promise.all to run queries concurrently
    const [
      liveMatchesCount,
      completedMatchesCount,
      cancelledMatchesCount,
      todayMatchesCount,
      tomorrowMatchesCount
    ] = await Promise.all([
      Match.countDocuments({ coordinatorId, MatchStatus: "Live" }),
      Match.countDocuments({ coordinatorId, MatchStatus: "Completed" }),
      Match.countDocuments({ coordinatorId, MatchStatus: "Cancelled" }),
      Match.countDocuments({ coordinatorId, start_date: formattedDate }),
      Match.countDocuments({ coordinatorId, start_date: tomorrowDate })
    ]);

    return res.status(200).json({
      result: "true",
      message: "Dashboard data fetched successfully",
      liveMatchesCount,
      completedMatchesCount,
      cancelledMatchesCount,
      todayMatchesCount,
      tomorrowMatchesCount
    });

  } catch (err) {
    return res.status(400).json({
      result: "false",
      message: err.message,
    });
  }
};




const coordinatorComissionList = async (req, res) => {
  try {
    const { coordinatorId } = req.body;

    if (!coordinatorId) {
      return res.status(400).json({
        result: "false",
        message: "Required fields are coordinatorId",
      });
    }

    const data= await Comission.find({coordinatorId}).sort({_id:-1});
    if(!data || data.length===0){
      return res.status(400).json({result:"false",message:"Record not found"})
    }

    return res.status(200).json({
      result: "true",
      message: "Comission list data fetched successfully",
      data:data
    });

  } catch (err) {
    return res.status(400).json({
      result: "false",
      message: err.message,
    });
  }
};



const coordinatorTransjectionList = async (req, res) => {
  try {
    const { coordinatorId } = req.body;

    if (!coordinatorId) {
      return res.status(400).json({
        result: "false",
        message: "Required fields are coordinatorId",
      });
    }

    const data= await Transjection.find({coordinatorId}).sort({_id:-1});
    if(!data || data.length===0){
      return res.status(400).json({result:"false",message:"Record not found"})
    }

    return res.status(200).json({
      result: "true",
      message: "Comission list data fetched successfully",
      data:data
    });

  } catch (err) {
    return res.status(400).json({
      result: "false",
      message: err.message,
    });
  }
};




const updateCoordinatorTeamList=async(req,res)=>{
  try{
    const {
    coordinatorId,
    betId,
    leagueName,
    teamName1,
    teamName2,
    sortName1,
    sortName2,
    start_date,
    expire_date,
    start_time,
    expire_time,

    }=req.body;

    if(!coordinatorId ){
      return res.status(400).json({result:"false",message:"Required fields are coordinatorId,betId,leagueName,teamName1,teamName2,sortName1,sortName2,start_date,expire_date,logo1,logo2"})
    }
    const updateData={
    leagueName,
    teamName1,
    teamName2,
    sortName1,
    sortName2,
    start_date,
    expire_date,
    start_time,
    expire_time,

    };

     // Check and add logos if provided in the request
     if (req.files && req.files['logo1']) {
      updateData.logo1 = req.files['logo1'][0].filename;
    }
    if (req.files && req.files['logo2']) {
      updateData.logo2 = req.files['logo2'][0].filename;
    }

    
    const Match_list=await Match.findOneAndUpdate({
      coordinatorId,
      _id:betId
      
    },updateData,{new:true});


    res.status(200).json({result:"true",message:"Data updated sucessfully",data:Match_list})

  }catch(err){
    res.status(400).json({ result: "false", message: err.message });
  }

};



const unmatchedBetList = async (req, res) => {
  try {
    const {matchId,outcome,userId} = req.body;

    // Check if required fields are provided
    if (!matchId || !outcome) {
      return res.status(400).json({
        result: "false",
        message: "Required fields are matchId,userId,outcome (A or B)"
      });
    }

//change here
    const unmatchingBet = await Bets.find({ matchId,matched:"false",userId: { $ne:userId },outcome: { $ne:outcome }}).populate('userId');

    if (!unmatchingBet || unmatchingBet.length===0) {
      return res.status(400).json({
        result: "false",
        message: "Record not found",
      });
    }
    const dinu=await  unmatchingBet.map(item=>({
      bet_id:item._id,
      matchId:item.matchId ,
      coordinatorId:item.coordinatorId,
      userId:item.userId._id, 
      uniqueName:item.userId.uniqueName,
      userProfile:item.userId.userProfile,
      amount:item.amount,
      bets_status:"Pending"
    }));

    return res.status(200).json({
      result: "true",
      message: "Unmatched bets list got sucessfully",
      data:dinu
    });
    
  } catch (err) {
    res.status(400).json({ result: "false", message: err.message });
  }
};




const MatchDetails=async(req,res)=>{
  try{
    const {
    matchId,
    coordinatorId,
    }=req.body;

    if(!matchId){
      return res.status(400).json({result:"false",message:"Required fields are matchId,coordinatorId"})
    }

    const Match_list=await Match.findOne({
      _id:matchId,
      
    });


if(!Match_list){
  return  res.status(400).json({result:"false",message:"Record not found"})
}
//agora live streaming
const liveToken=await Live.findOne({matchId,coordinatorId});
if(liveToken && liveToken.length>0){
 return liveToken;
}


let totalbetsAmount = 0;
let payoutAmount=0;
const countData = await Bets.find({ matchId, matched: "true" }); // Fixing "ture" to "true"
totalbetsAmount = countData.reduce((sum, item) => sum + item.amount, 0); // Adding initial value (0) and returning the sum
payoutAmount=Math.round(Number(totalbetsAmount -(totalbetsAmount*0.1)));

    res.status(200).json({
      result:"true",
      message:"Match details got  sucessfully",
      data:Match_list,
      totalbetsAmount,
      payoutAmount,
      uid:liveToken?.uid||null,
      token:liveToken?.token || null,
      channelName:liveToken?.channelName ||null
    })

  }catch(err){
    res.status(400).json({ result: "false", message: err.message });
  }

};




const searchingBet=async(req,res)=>{
  try{
    const {
    matchId,
    userId,
    amount,
    outcome,
    coordinatorId,
    }=req.body;

    if(!matchId || !amount){
      return res.status(400).json({result:"false",message:"Required fields are matchId,amount,outcome,userId,coordinatorId"})
    }

     // Fetch user balance
     const userBalance = await User.findOne({ _id: userId });
     if (!userBalance) {
       return res.status(400).json({ result: "false", message: "Invalid user" });
     }
 
     // Check if user has sufficient balance
     if (amount > userBalance.userWallet) {
       return res.status(400).json({ result: "false", message: "Insufficient balance" });
     }
 
     // Check if amount is greater than zero
     if (amount <= 0) {
       return res.status(400).json({ result: "false", message: "Minimum amount must be greater than 0" });
     }

    const bet_list=await Bets.findOne({
       matchId,
       amount,
       outcome: {$ne:outcome},
       matched:false
    }).populate('userId');

if(!bet_list){
  // insert data
  const newBet = new Bets({ userId, matchId, amount, outcome,coordinatorId, matched: false });
  const savedBet = await newBet.save();
   res.status(400).json({result:"false",message:"Bet placed  successfully"});

}else{

const users=await User.findOne({_id:userId});
// transjection  insert data in database
const transId=generateTransjectionNumber();
const transjectionData=new Transjection({userId,amount,tranjectionType:"Apply bet",transjectionId:transId,matchId});
await transjectionData.save();


  //bets place 
  // If no matching bet is found, create a new unmatched bet
  const newBet = new Bets({ userId, coordinatorId, matchId, amount, outcome, matched: true,competitionId:bet_list.userId});
  const savedBet = await newBet.save();

  const remaining_amount=Number(users.userWallet - amount);
  await User.findOneAndUpdate({_id:userId},{userWallet:remaining_amount},{new:true});
  await Bets.findOneAndUpdate(
    { _id:bet_list._id },
    { matched: true,competitionId:userId},
    { new: true }
  );
 
const bet_user={
  matchId:matchId,
  userId:userId, 
  uniqueName:users.uniqueName,
  userProfile:users.userProfile,
  amount:amount,

}

const dinu={
  bet_id:bet_list._id,
  matchId:bet_list.matchId,
  coordinatorId:bet_list.coordinatorId,
  userId:bet_list.userId._id, 
  uniqueName:bet_list.userId.uniqueName,
  userProfile:bet_list.userId.userProfile,
  amount:bet_list.amount,

};
console.log(bet_list,bet_list.userId)
res.status(200).json({result:"true",message:"Bet placed and matched successfully",data1:bet_user,data2:dinu})
}

}catch(err){
  res.status(400).json({ result: "false", message: err.message });
}

};



const updateMatcheStatus=async(req,res)=>{
	try{
		const {matchId,matchStatus}=req.body;
		if(!matchId || !matchStatus){
			return res.status(400).json({result:"false",message:"required matchId,matchStatus"})
		}
		const updatedData =await Match.findOneAndUpdate({_id:matchId},{matchStatus},{new:true});
		res.status(200).json({result:"true",message:"Match status updated sucessfully"})

	}catch(error){
		res.status(400).json({result:"false",message:error.message})
	}

};




const updateMatcheResult = async (req, res) => {
  try {
    const { matchId,coordinatorId, winnerTeam } = req.body;

    // Validate input
    if (!matchId || !winnerTeam) {
      return res
        .status(400)
        .json({result:"false",message: "Required fields: matchId,coordinatorId, winnerTeam" });
    }

    // Update the match with the winner team
    const updatedData = await Match.findOneAndUpdate(
      { _id: matchId },
      { winnerTeam },
      { new: true }
    );

    if (!updatedData) {
      return res.status(404).json({
        result: "false",
        message: "Match not found",
      });
    }

    // Find winning bets
    const bets = await Bets.find({ matched: true, outcome: winnerTeam });

    if (!bets.length) {
      return res.status(200).json({
        result: "true",
        message: "Match updated successfully, but no winning bets found.",
      });
    }
    var totalPot=0;
    var app_fee=0;
    var coordinator_fee=0;

    // Distribute winnings
    for (const bet of bets) {
      const total = bet.amount * 2; // Total payout
      const commission = total * 0.10; // 10% commission
      const payout = total - commission; // Final amount after commission

     
      // Update bet amount
      await Bets.findByIdAndUpdate(bet._id, {
        $set: {winning_amount: payout},
      });
     
  // Update total values
  totalPot += total;
  app_fee += commission;

    }
    coordinator_fee = app_fee * 0.04;

const insertdata=new Comission({
  matchId,
  coordinatorId,
  appComission:app_fee,
  coordinatorComission:coordinator_fee,
  totalPot
});
await insertdata.save();
    res.status(200).json({
      result: "true",
      message: "Match status updated and winnings distributed successfully.",
    });
  } catch (error) {
    res.status(500).json({
      result: "false",
      message: error.message,
    });
  }
};



const findingMatched_bet=async(req,res)=>{
  try{
    const {
    matchId,
    userId,
    amount,
    outcome,
    
    }=req.body;

    if(!matchId || !amount){
      return res.status(400).json({result:"false",message:"Required fields are matchId,amount,outcome,userId"})
    }

     
    const bet_list=await Bets.findOne({
       matchId,
      amount,
      outcome: {$ne:outcome},
      matched:true
    }).populate('userId');

    
if(bet_list){
const users=await User.findOne({_id:userId});
const bet_user={
  matchId:matchId,
  userId:userId, 
  uniqueName:users.uniqueName,
  userProfile:users.userProfile || '',
  amount:amount,

}

const dinu={
  bet_id:bet_list._id,
  matchId:bet_list.matchId,
  coordinatorId:bet_list.coordinatorId,
  userId:bet_list.userId._id, 
  uniqueName:bet_list.userId.uniqueName,
  userProfile:bet_list.userId.userProfile || '',
  amount:bet_list.amount,

};
// transjection  insert data in database
const transId=generateTransjectionNumber();
const transjectionData=new Transjection({userId,amount,tranjectionType:"Apply bet",transjectionId:transId,matchId});
await transjectionData.save();
const remaining_amount=Number(users.userWallet);
await User.findOneAndUpdate({_id:userId},{userWallet:remaining_amount},{new:true});

  res.status(200).json({
    result:"true",
    message:"Bet list got  sucessfully",data2:dinu,data1:bet_user
  })
}else {
   return res.status(400).json({result:"false",message:"Record not found"});
}

  }catch(err){
    res.status(400).json({ result: "false", message: err.message });
  }

};




const sendBet_request=async(req,res)=>{
  try{
    const {
    matchId,
    userId,
    amount,
    outcome,
    coordinatorId,
    competitionId,
    }=req.body;

    if(!matchId || !amount || !competitionId){
      return res.status(400).json({result:"false",message:"Required fields are matchId,amount,outcome,userId,coordinatorId,competitionId"})
    }

     // Fetch user balance
     const userBalance = await User.findOne({ _id: userId });
     if (!userBalance) {
       return res.status(400).json({ result: "false", message: "Invalid user" });
     }
 
     // Check if user has sufficient balance
     if (amount > userBalance.userWallet) {
       return res.status(400).json({ result: "false", message: "Insufficient balance" });
     }
 
     // Check if amount is greater than zero
     if (amount <= 0) {
       return res.status(400).json({ result: "false", message: "Minimum amount must be greater than 0" });
     }


//bet place
const newBet = new Bets({ userId, matchId, amount, outcome,coordinatorId, matched:false,competitionId});
  const savedBet = await newBet.save();

 // fire notification
  const findusers=await User.findOne({_id:competitionId});
  const fcmId=findusers.fcmId;
  
  const dinuString = `User Name: ${userBalance.userName}, Amount: ${amount}`;
  // Send welcome notification
  const fcmToken = fcmId;
  const messagePayload = {
    notification: {
      title: "Bets request!",
      body:dinuString,
    },
    data: {
      extraInfo: "Some extra data",
    },
  };


  await sendNotification(fcmToken, messagePayload);

res.status(200).json({result:"true",message:"Bet request sent successfully"})

  
}catch(err){
  res.status(400).json({ result: "false", message: err.message });
}

};





const MatchedBet_userDetails=async(req,res)=>{
  try{
    const {
    matchId,
    userId,
    amount,
    outcome,
    coordinatorId,
    
    }=req.body;

    if(!matchId || !amount){
      return res.status(400).json({result:"false",message:"Required fields are matchId,amount,outcome,userId,coordinatorId"})
    }

    const bet_list=await Bets.findOne({
      matchId,
      amount,
      userId,
      outcome,
      matched:true
   }).populate('matchId userId competitionId');

   //agora live streaming
   const liveToken=await Live.findOne({matchId,coordinatorId});
   if(liveToken && liveToken.length>0){
    return liveToken;
   }

   if(!bet_list){
    return res.status(400).json({result:"false",message:"Record not found"});
   }
         const comptId=bet_list.competitionId._id;
    const bet_lists=await Bets.find({
       matchId,
       $or: [
        {userId:userId ,competitionId:comptId},
        { competitionId:userId , userId:comptId},
      ],
       matched:true
    });
    
    const t_amount=bet_lists.reduce((sum,item)=>{
     return  sum + item.amount;
    },0);
    const payoutAmount=t_amount-(t_amount*0.1);

    var status = '';
if (outcome === "B") {
  status = "A";
} else {
  status = "B";
}

    
    const teama={
      matchId:bet_list.matchId._id,
      coordinatorId:bet_list.matchId.coordinatorId,
      leagueName:bet_list.matchId.leagueName,
      teamName1:bet_list.matchId.teamName1,
      logo1:bet_list.matchId.logo1,
      sortName1:bet_list.matchId.sortName1,
      total_amount:t_amount,
      payoutAmount:payoutAmount,
      token:liveToken?.token || null,
      uid:liveToken?.uid || null,
      channelName:liveToken?.channelName || null,
    };
    const user1={
      outcome:outcome,
      userId:bet_list.userId._id,
      uniqueName:bet_list.userId.uniqueName,
      userName:bet_list.userId.userName,
      userProfile:bet_list.userId.userProfile || "",
      userWallet:bet_list.userId.userWallet,

    };
    const teamb={
    
    matchId:bet_list.matchId._id,
    coordinatorId:bet_list.matchId.coordinatorId,
    leagueName:bet_list.matchId.leagueName,
    teamName2:bet_list.matchId.teamName2,
    logo2:bet_list.matchId.logo2,
    sortName2:bet_list.matchId.sortName2,
    total_amount:t_amount,
    payoutAmount:payoutAmount,
    token:liveToken?.token || null,
    uid:liveToken?.uid || null,
    channelName:liveToken?.channelName || null,
    };

    user2={
    outcome:status,
    userId:bet_list.competitionId._id,
    uniqueName:bet_list.competitionId.uniqueName,
    userName:bet_list.competitionId.userName,
    userWallet:bet_list.competitionId.userWallet,
    userProfile:bet_list.competitionId.userProfile || "",
    }
    
    
    if (outcome === "A") {
      const data = {
        status:outcome,
        userId:comptId,
        team1: [
        
            teama,
            user1,
        
        ],
        team2:[ 
          teamb,
          user2,
        ],
      };
    
      res.status(200).json({
        result: "true",
        message: "Bet list got successfully",
        data: data,
      });
    } else {
      const data = {
        status:outcome,
        userId:comptId,
        team1: [
            teama,
            user2,
        ],
        team2: [
          teamb,
          user1,
        ],
      };
    
      res.status(200).json({
        result: "true",
        message: "Bet list got successfully",
        data: data,
      });
    }
    
   


  }catch(err){
    res.status(400).json({ result: "false", message: err.message });
  }

};



const getBet_request=async(req,res)=>{
  try{
    const {
    matchId,
    userId,
    outcome,
    coordinatorId,
    }=req.body;

    if(!matchId || !userId){
      return res.status(400).json({result:"false",message:"Required fields are matchId,outcome,userId,coordinatorId"})
    }

    const getBet=await Bets.findOne({
      matchId,competitionId:userId,
      coordinatorId,
      matched:false,
      outcome:{$ne:outcome}
    });
    if(!getBet){
   return res.status(400).json({result:"false",message:"Record not found"})
    }

res.status(200).json({result:"true",message:"Bet request got successfully",data:getBet})

  
}catch(err){
  res.status(400).json({ result: "false", message: err.message });
}

};



const acceptBetRequest=async(req,res)=>{
  try{
    const {userId,betId,outcome,status,amount}=req.body;
    
    if(!(req.body)){
      return res.status(400).json({result:"false",message:"Required fields are userId,betId,outcome,amount(status 0 for accept 1 for discline"})

    }

    if(status==1){
      await Bets.findByIdAndDelete({_id:betId});
      return  res.status(200).json({result:"true",message:"Bet request disclined successfully"})
    };

    // Fetch user balance
    const userBalance = await User.findOne({ _id: userId });
    if (!userBalance) {
      return res.status(400).json({ result: "false", message: "Invalid user" });
    }

    // Check if user has sufficient balance
    if (amount > userBalance.userWallet) {
      return res.status(400).json({ result: "false", message: "Insufficient balance" });
    }

    // Check if amount is greater than zero
    if (amount <= 0) {
      return res.status(400).json({ result: "false", message: "Minimum amount must be greater than 0" });
    }

    const findbets=await Bets.findOne({_id:betId,competitionId:userId});
    if(!findbets){
      return res.status(400).json({result:"false",message:"betId is wrong"})
    }

    const amounts=findbets.amount;
    const matchId=findbets.matchId;
    const coordinatorId=findbets.coordinatorId;
    const competitionId=findbets.userId;

    //placed new bets
    // transjection  insert data in database
  const transId=generateTransjectionNumber();
  const transjectionData=new Transjection({userId,amount:amount,tranjectionType:"Apply bet",transjectionId:transId,matchId});
   await transjectionData.save();


  //bets place 
  // If no matching bet is found, create a new unmatched bet
  const newBet = new Bets({ userId, coordinatorId, matchId, amount, outcome, matched: true,competitionId});
  const savedBet = await newBet.save();
const users=await User.findOne({_id:userId});
  const remaining_amount=Number(users.userWallet - amount);
  await User.findOneAndUpdate({_id:userId},{userWallet:remaining_amount},{new:true});

  await Bets.findOneAndUpdate(
    { _id:betId },
    { matched: true,competitionId:userId},
    { new: true }
  );

  const userss=await User.findOne({_id:findbets.userId});
  const remaining_amounts=Number(userss.userWallet - amount);
  await User.findOneAndUpdate({_id:findbets.userId},{userWallet:remaining_amounts},{new:true});
  res.status(200).json({result:"true",message:"Bet request accept successfully"})


  }catch(err){
    res.status(400).json({result:"false",message:err.message})
  }
};



const userTranjectionList=async(req,res)=>{
  try{
    const {userId,status}=req.body;
    if(!userId){
      return res.status(400).json({result:"false",message:"Required field is userId,status (0 for bets and 1 for all)"})
    }
    if(status==0){
      const List=await  Transjection.find({userId,tranjectionType:"Apply bet"}).populate('matchId').sort({_id: -1});
    if(!List || List.length===0){
      return res.status(400).json({result:"false",message:"Record does not found"});
      
    }
    res.status(200).json({result:"true",message:"Transjection list got successfully",data:List})

    }else{
    const transjectionList=await  Transjection.find({userId}).sort({_id: -1});
    if(!transjectionList || transjectionList.length===0){
      return res.status(400).json({result:"false",message:"Record does not found"});
      
    }
    res.status(200).json({result:"true",message:"Transjection list got successfully",data:transjectionList})
}
  }catch(err){
    res.status(400).json({result:"false",message:err.message});
  }

};


const  userBetsList=async(req,res)=>{
  const {userId}=req.body;
  if(!userId){
    return res.status(400).json({result:"false",message:"Required field is userId"});
  }
  const list=await Bets.find({userId}).populate('matchId').sort({_id:-1});
  if(!list || list.length==0){
    return res.status(400).json({result:"false",message:"Record not found"});
  }
  res.status(200).json({result:"true",message:"Bets list got successfully",data:list})

};



const  userWithdrawRequest=async(req,res)=>{
  try{
  const {userId,amount,date}=req.body;
  if(!userId || !amount){
    return res.status(400).json({result:"false",message:"Required field is userId,amount,date"});
  }
  const user=await User.findOne({_id:userId});
  if(!user){
    return res.status(400).json({result:"false",message:"Invalid userId"})
  }
  const walletAmount=user.userWallet;
  if(!(walletAmount>=amount)){
 return res.status(400).json({result:"false",message:"Insufficient blance"})
  }
  const insertData=new Withdraw({userId,amount,date});
  const data=await insertData.save();
  res.status(200).json({result:"true",message:"Withdraw request successfully",data:data})

}catch(err){
  console.log(err.message)
  res.status(400).json({result:"false",message:err.mesage});
}
};



const  userWithdrawList=async(req,res)=>{
  try{
  const {userId}=req.body;
  if(!userId){
    return res.status(400).json({result:"false",message:"Required field is userId"});
  }
  
  const data= await Withdraw.find({userId}).sort({createdAt:-1});
  if(!data || data.length ===0){
    return res.status(400).json({result:"false",message:"Record not found"});
  }
  res.status(200).json({result:"true",message:"Withdraw request successfully",data:data})

}catch(err){
  console.log(err.message)
  res.status(400).json({result:"false",message:err.mesage});
}
};



const goLive=async(req,res)=>{
  try{
    const {coordinatorId,matchId}=req.body;
    if(!coordinatorId || !matchId){
      return res.status(400).json({result:"false",message:"required fields are coordinatorId,matchId"});
    }

// Agora credentials
const APP_ID = "4f9df23b3c384445b7a385f2b019955e";
const APP_CERTIFICATE = "f1c07ec045004278af1c4a3e54e3354c";
const channelName =generateRandomString();
 const uid =generate_udi();
  

// Generate token function
const generateAgoraToken = (channelName, uid) => {
  if (!APP_ID || !APP_CERTIFICATE) {
    throw new Error("Missing App ID or App Certificate");
  }

  // Generate the token
  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channelName,
    uid
  );

  return token;
};

  const token = generateAgoraToken(channelName, uid);
  const data={
    channelName,
    uid,
    token,
    coordinatorId,
    matchId,


  };
  const insertData =new Live(data);
  await insertData.save();
  res.status(200).json({result:"true",message:"Token got successfully",data:data})

  }catch(err){
    res.status(400).json({result:"false",message:err.message
  });
}
};





/*....................exports variables...........*/
module.exports = {
  userSignupApi,
  userLoginApi,
  forgotPassword,
  resetPassword,
  updateUser_profile,
  getUser_profile,
  category_list,
  support_list,
  aboutus_list,
  addUserAmount,
  coordinatorSignupApi,
 coordinatorLoginApi,
 coordinatorForgotPassword,
 coordinatorResetPassword,
 updateCoordinatorProfile,
 getCoordinatorProfile,
 createMatch,
 MatchList,
 coordinatorTeamList,
 updateCoordinatorComission,
 coordinatorDashboardCount,
 coordinatorComissionList,
 coordinatorTransjectionList,
 updateCoordinatorTeamList,
 unmatchedBetList,
 MatchDetails,
 searchingBet,
 updateMatcheStatus,
 updateMatcheResult,
 findingMatched_bet,
 sendBet_request,
 MatchedBet_userDetails,
 getBet_request,
 acceptBetRequest,
 userTranjectionList,
 userBetsList,
 userWithdrawRequest,
 userWithdrawList,
 goLive,
 

};
