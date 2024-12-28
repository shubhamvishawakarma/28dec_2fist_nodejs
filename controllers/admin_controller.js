/*.........import models............*/
const User = require("../models/user_models");
const ContactUs = require("../models/contactus_models");
const PrivacyModel = require("../models/privacyPolicy_models");
const AboutUs = require("../models/aboutus_models");
const Category = require("../models/category_models");
const Admin = require("../models/admin_models");
const Match=require("../models/matches_models");
const Coordinator = require("../models/coordinator_models");
const Comission=require("../models/comission_models");
const Transjection=require("../models/transjection_models");
const Bets=require("../models/bets_models.js");




/*............import dependancies................*/
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { status } = require("init");
const admin = require("firebase-admin");



/*.................make function and user it........*/
function generate_otp() {
	const OTP = Math.floor(1000 + Math.random() * 9000);
	return OTP;
}

function generateRandomString() {
	const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	const length = 8;
	let randomString = '';

	for (let i = 0; i < length; i++) {
		const index = Math.floor(Math.random() * characters.length);
		randomString += characters.charAt(index);
	}

	return randomString;

}



/*........................CREATE API................*/
// create category api
const createCategory = async (req, res) => {
	try {
		const {categoryName} = req.body;
		const category_image = req.file ? req.file.filename : null;
		console.log(categoryName,category_image)
		if (!categoryName || category_image == null) {
			return res.status(400).json({ "result": "false", "message": "require parameters are categoryName,category_image" })
		} 
			const insertData = new Category({
				categoryName,
				category_image,

			});
			const data = await insertData.save();
			res.status(200).json({ "result": "true", "message": "Category inserted sucessfully", data: data })
		
	} catch (err) {
		console.log(err)
		res.status(400).json({ "result": "false", "message": err.message });

	}

};



// update category api
const updateCategory = async (req, res) => {
	try {
		const {categoryId, categoryName} = req.body;
		const category_image = req.file ? req.file.filename : null;
		if (!categoryId) {
			res.status(400).json({ "result": "false", "message": "require parameters is categoryId and optionals are categoryName,category_image" })
		} else {
			if(req.file){
				
			const modifiedData = await Category.findByIdAndUpdate({ _id: categoryId },
				{ $set: {category_image,categoryName} }, { new: true });
			res.status(200).json({ "result": "true", "message": "Category updated sucessfully", data: modifiedData })
			}else{

			const modifiedData = await Category.findByIdAndUpdate({ _id: categoryId },
				{ $set: {categoryName } }, { new: true });
			res.status(200).json({ "result": "true", "message": "Category updated sucessfully", data: modifiedData })
		}
	}


	} catch (err) {
		console.log(err)
		res.status(400).json({ "result": "false", "message": err.message });

	}

}; 




//category list api
const getCategory = async (req, res) => {
	try {
		const Data = await Category.find({});
		if (!Data) {
			res.status(400).json({ "result": "false", "message": " Data does not found" })

		} else {
			res.status(200).json({ "result": "true", "message": " Category list are ", data: Data })
		}


	} catch (err) {
		console.log(err)
		res.status(400).json({ "result": "false", "message": err.message });

	}

};



// category active and deactive api
const activeDeactive_category = async (req, res) => {
	try {
		const { categoryId } = req.body;
		if (!categoryId) {
			res.status(400).json({ "result": "false", "message": "required parameter is categoryId" });

		} else {
			const findData = await Category.findOne({ _id: categoryId });
			if (findData.acrtive_status == 0) {
				const data = await Category.findByIdAndUpdate({ _id: categoryId }, { $set: { acrtive_status: 1 } }, { new: true });
				res.status(200).json({ "result": "true", "message": " Category Deactive sucessfully" })
			} else {
				await Category.findByIdAndUpdate({ _id: categoryId }, { $set: { acrtive_status: 0 } }, { new: true });
				res.status(200).json({ "result": "true", "message": " Category Active sucessfully" })
			}
		}

	}

	catch (err) {
		res.status(400).json({ "result": "false", "message": err.message });
	}



};


//delete subcategory api
const deleteCategory = async (req, res) => {
	const { categoryId } = req.body;
	if (!categoryId) {
		res.status(400).json({ "result": "false", "message": "required parameter is categoryId" })
	};
	try {
		const data = await Category.findById({ _id: categoryId });
		if (!data) {
			res.status(400).json({ "result": "false", "message": "Category is not found" })
		} else {
			await Category.findByIdAndDelete({ _id: categoryId })
			res.status(200).json({ "result": "true", "message": "category deleted sucessfully" })
		}

	} catch (err) {
		res.status(400).json({ "result": "false", "message": err.message });

	}


};


//get category by id
const getCategory_byId = async (req, res) => {
	const { categoryId } = req.body;
	if (!categoryId) {
		res.status(400).json({ "result": "false", "message": "required parameter is categoryId" })
	};
	try {
		const data = await Category.findById({ _id: categoryId });
		if (!data) {
			res.status(400).json({ "result": "false", "message": "Category is not found" })
		} else {
			res.status(200).json({ "result": "true", "message": "category list is", data: data })
		}

	} catch (err) {
		res.status(400).json({ "result": "false", "message": err.message });

	}

};





/*........................................customer details api............. */

// Customer list api
const customerList = async (req, res) => {
	try {
		const data = await User.find({}).sort({ _id: -1 });
		if (!data) {
			return res.status(400).json({ "result": "true", "message": "Data does not found" })

		}
			
			res.status(200).json({ "result": "true", "message": " Customer list is sucessfully", data:data})

	} catch (err) {
		res.status(400).json({ "result": "false", "message": err.message });
	}


};



// user block_unblock api
const userBlock_unblock_api = async (req, res) => {
	try {
		const { userId } = req.body;
		if (!userId) {
			res.status(400).json({ "result": "false", "message": "required parameter is userId" });

		} else {
			const findData = await User.findOne({ _id: userId });
			if (findData.userStatus == 0) {
				const data = await User.findByIdAndUpdate({ _id: userId }, { $set: {userStatus: 1 } }, { new: true });
				res.status(200).json({ "result": "true", "message": " Customer blocked sucessfully" })
			} else {
				await User.findByIdAndUpdate({ _id: userId }, { $set: { userStatus: 0 } }, { new: true });
				res.status(200).json({ "result": "true", "message": " Customer unblock sucessfully" })
			}
		}

	}

	catch (err) {
		res.status(400).json({ "result": "false", "message": err.message });
	}



};

//customerDetails
const customerDetails = async (req, res) => {
	try {
		const { userId } = req.body;
		if (!userId) {
			res.status(400).json({ "result": "false", "message": "required parameter is userId" });

		} else {
			const findData = await User.findOne({ _id: userId });
			if (findData) {
				res.status(200).json({ "result": "true", "message": " Customer details show sucessfully", data: findData })
			} else {

				res.status(400).json({ "result": "true", "message": " Customer does not found" })
			}
		}

	}

	catch (err) {
		res.status(400).json({ "result": "false", "message": err.message });
	}

};

/*........................customers end operation.................... */




/*  .........................privacy and pulicy start operation................. */
// create privacy pollicy api
const create_privacyPolicy = async (req, res) => {
	try {
		const { title, text} = req.body;
		if (!title || !text) {
			return res.status(400).json({ "result": "false", "message": "require parameters are title, text" });
		}

		let matchData = await PrivacyModel.findOne({type:1});

		if (matchData) {
				const updated = await PrivacyModel.findOneAndUpdate({type:1 }, { title, text}, { new: true });
				res.status(200).json({ "result": "true", "message": "Data updated successfully", data: updated });
		} else {
			const insertData = new PrivacyModel({ title, text});
			const data = await insertData.save();
			res.status(200).json({ "result": "false", "message": "Data inserted successfully", data: data });
		}
	} catch (err) {
		console.log(err.message);
		res.status(400).json({ "result": "false", "message": err.message });
	}
};





// privacy list api
const privacy_list = async (req, res) => {
	try {

		const data = await PrivacyModel.find({});
		if (!data) {
			res.status(200).json({ "result": "false", "message": "data does not found" });

		} else {
			res.status(200).json({ "result": "false", "message": "privacy list are", data: data });
		}


	} catch (err) {
		console.log(err.message)
		res.status(400).json({ "result": "false", "message": err.message })
	}

};



const create_contactUs = async (req, res) => {
	try {
		const { location, phone_no, email, whatsapp_number } = req.body;

		// Validate required fields
		if (!location || !phone_no || !email || !whatsapp_number) {
			return res.status(400).json({ 
				result: "false", 
				message: "Required parameters: location, phone_no, email, whatsapp_number" 
			});
		}

		// Check if data already exists
		const existingData = await ContactUs.findOne({ type: 1 });

		if (existingData) {
			// Update existing data
			const updatedData = await ContactUs.findOneAndUpdate(
				{ type: 1 }, 
				{ location, phone_no, email, whatsapp_number }, 
				{ new: true }
			);
			return res.status(200).json({
				result: "true", 
				message: "Data updated successfully", 
				data: updatedData 
			});
		} else {
			// Insert new data
			const newData = new ContactUs({
				location,
				phone_no,
				email,
				whatsapp_number
			});
			const savedData = await newData.save();
			return res.status(201).json({
				result: "true", 
				message: "Data inserted successfully", 
				data: savedData 
			});
		}
	} catch (err) {
		// Handle errors
		console.error("Error in create_contactUs:", err.message);
		return res.status(500).json({ 
			result: "false", 
			message: "Server error: " + err.message 
		});
	}
};




// contact us list api
const contactUs_list = async (req, res) => {
	try {

		const data = await ContactUs.find({});
		if (!data) {
			res.status(200).json({ "result": "false", "message": "data does not found" });

		} else {
			res.status(200).json({ "result": "false", "message": "contact list are", data: data });
		}


	} catch (err) {
		console.log(err.message)
		res.status(400).json({ "result": "false", "message": err.message })
	}

};



// create about us api
const create_about_us = async (req, res) => {
	try {
		const { title, text} = req.body;
		if (!title || !text ) {
			return res.status(400).json({ "result": "false", "message": "require parameters are title, text"});
		}

		let matchData = await AboutUs.findOne({});
		if (matchData) {
				const updated = await AboutUs.findOneAndUpdate({type:1}, { title, text}, { new: true });
				res.status(200).json({ "result": "true", "message": "Data updated successfully",data:updated});
			}
			const insertData = new AboutUs({ title, text});
			const data = await insertData.save();
			res.status(200).json({ "result": "true", "message": "Data inserted successfully", data: data });
		
	} catch (err) {
		console.log(err.message)
	}

};




// about list api
const aboutUs_list = async (req, res) => {
	try {

		const data = await AboutUs.find({});
		if (!data) {
			res.status(200).json({ "result": "false", "message": "data does not found" });

		} else {
			res.status(200).json({ "result": "false", "message": "About list are", data: data });
		}


	} catch (err) {
		console.log(err.message)
		res.status(400).json({ "result": "false", "message": err.message })
	}

};






//   Admin singup api
const AdminSignup = async (req, res) => {
	try {
		const { email, password,first_name,last_name,address } = req.body;
		if (!email || !password) {
		return 	res.status(400).json({ "result": "false", "message": "required parameter are email,password,and optionals are first_name,last_name,address" });
		}

		const matchData = await Admin.findOne({ email: email });
		if (matchData) {
			res.status(400).json({ "result": "false", "message": "Staff allready exist" })
		} else {
			// Hash the password before saving it
			const hashedPassword = await bcrypt.hash(password, 10);
			const newUser = new Admin({ email, password: hashedPassword,first_name,last_name,address,type:0});
			const data = await newUser.save();
			res.status(200).json({ "result": "true", "message": "Staff created sucessfully", data: data })
		}
	} catch (err) {
		res.status(400).json({ "result": "false", "message": err.message });
	}

};




//  Admin  Login api
const AdminLogin = async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
		 return	res.status(400).json({ "result": "false", "message": "required parameter are email,password" });
		} 
			const matchData = await Admin.findOne({email});
			if (!matchData) {
				return res.status(400).json({ "result": "false",
					"message": "Invalid email and password"
					})
			}
			if(matchData.staff_status=="1"){
				return res.status(400).json({ "result": "false", "message": "Your account has been blocked" });
			}

			if(matchData.type=="0"){
				// Compare the provided password with the hashed password in the database
				const passwordMatch = await bcrypt.compare(password, matchData.password);
 
				if (!passwordMatch) {
                    return res.status(400).json({ "result": "false", "message": "Invalid email and password" });
				}else{
					// Generate a JWT token
					const token = jwt.sign({ adminId: matchData._id, email: matchData.email }, process.env.ACCESS_TOKEN_SECURITY, { expiresIn: '24h' });
					res.status(200).json({ "result": "true", "message": "Admin login sucessfully",
						 token,
						  data: matchData,
						  
						  
						})
				}
				
			}else{
				// Compare the provided password with the hashed password in the database
				const passwordMatch = await bcrypt.compare(password, matchData.password);
 
				if (!passwordMatch) {
					return res.status(400).json({ "result": "false", "message": "Invalid email and password" });
				} else {
					// Generate a JWT token
					const token = jwt.sign({ adminId: matchData._id, email: matchData.email }, process.env.ACCESS_TOKEN_SECURITY, { expiresIn: '24h' });
					const dinu=matchData.restrictions;
					res.status(200).json({ "result": "true", "message": "Staff login sucessfully", token, data: matchData,permission:dinu })
				}

			}
	
		}catch (err) {
		res.status(400).json({ "result": "false", "message": err.message });
	}

};




/*........................................coordinator details api............. */

// Customer list api
const coordinatorList = async (req, res) => {
	try {
		const data = await Coordinator.find({}).sort({ _id: -1 });
		if (!data) {
			return res.status(400).json({ "result": "true", "message": "Data does not found" })

		}
			
			res.status(200).json({ "result": "true", "message": " Coordinator list is sucessfully", data:data})

	} catch (err) {
		res.status(400).json({ "result": "false", "message": err.message });
	}

};



// user block_unblock api
const coordinatorBlock_unblock_api = async (req, res) => {
	try {
		const { coordinatorId } = req.body;
		if (!coordinatorId) {
			res.status(400).json({ "result": "false", "message": "required parameter is coordinatorId" });

		} else {
			const findData = await Coordinator.findOne({ _id: coordinatorId });
			if (findData.coordinatorStatus == 0) {
				const data = await Coordinator.findByIdAndUpdate({ _id: coordinatorId }, { $set: {coordinatorStatus: 1 } }, { new: true });
				res.status(200).json({ "result": "true", "message": " Coordinator blocked sucessfully" })
			} else {
				await Coordinator.findByIdAndUpdate({ _id: coordinatorId }, { $set: { coordinatorStatus: 0 } }, { new: true });
				res.status(200).json({ "result": "true", "message": " Coordinator unblock sucessfully" })
			}
		}

	}

	catch (err) {
		res.status(400).json({ "result": "false", "message": err.message });
	}
};




//customerDetails
const coordinatorDetails = async (req, res) => {
	try {
		const { coordinatorId } = req.body;
		if (!coordinatorId) {
			res.status(400).json({ "result": "false", "message": "required parameter is coordinatorId" });

		} else {
			const findData = await Coordinator.findOne({ _id: coordinatorId });
			if (findData) {
				res.status(200).json({ "result": "true", "message": " Coordinator details show sucessfully", data: findData })
			} else {

				res.status(400).json({ "result": "true", "message": " Coordinator does not found" })
			}
		}

	}

	catch (err) {
		res.status(400).json({ "result": "false", "message": err.message });
	}

};




// user block_unblock api
const coordinatorApprove_api = async (req, res) => {
	try {
		const { coordinatorId } = req.body;
		if (!coordinatorId) {
			return res.status(400).json({ "result": "false", "message": "required parameter is coordinatorId" });

		}
			const findData = await Coordinator.findOne({ _id: coordinatorId });
			if (findData.Status == 1) {
				return res.status(400).json({ "result": "false", "message": " Coordinator Allready Approved sucessfully" })
			}

			if (findData.Status == 0) {
				const data = await Coordinator.findByIdAndUpdate({ _id: coordinatorId }, { $set: {Status: 1 } }, { new: true });
				return res.status(200).json({ "result": "true", "message": " Coordinator Approved sucessfully" })
			}
	
	}
	catch (err) {
		res.status(400).json({ "result": "false", "message": err.message });
	}
};

/*........................coordinator end operation.................... */

/*........................matches start operation.................... */
const matcheLists=async(req,res)=>{
	try{
		const matchlist=await Match.find({}).populate('categoryId coordinatorId');
		if(!matchlist || matchlist.length==0){
			res.status(400).json({result:"false",message:"Record not found"})
		}
		const data= await matchlist.map(item=>({
			matchId:item._id,
			categoryName:item.categoryId.categoryName,
			coordinatorName:item.coordinatorId.coordinatorName,
			leagueName:item.leagueName,
            teamName1:item.teamName1,
            teamName2:item.teamName2,
            logo1:item.logo1,
            logo2:item.logo2,
            sortName1:item.sortName1,
            sortName2:item.sortName2,
            start_date:item.start_date,
            expire_date:item.expire_date,
            start_time:item.start_time,
            expire_time:item.expire_time,
			matchStatus:item.matchStatus,
			winnerTeam:item.matchStatus,


		}));
		
		res.status(200).json({result:"true",message:"Match list got sucessfully",data:data})

	}catch(error){
		res.status(400).json({result:"false",message:error.message})
	}

};


//matches details
const matchDetails=async(req,res)=>{
	try{
		const {matchId}=req.body;
		const details=await Match.findById({_id:matchId}).populate('categoryId coordinatorId');
		if(!details){
			res.status(400).json({result:"false",message:"Invalid matchId"})
		}
		const data={
			matchId:details._id,
			categoryName:details.categoryId.categoryName,
			coordinatorName:details.coordinatorId.coordinatorName,
			leagueName:details.leagueName,
            teamName1:details.teamName1,
            teamName2:details.teamName2,
            logo1:details.logo1,
            logo2:details.logo2,
            sortName1:details.sortName1,
            sortName2:details.sortName2,
            start_date:details.start_date,
            expire_date:details.expire_date,
            start_time:details.start_time,
            expire_time:details.expire_time,

		};
		res.status(200).json({result:"true",message:"Match details got sucessfully",data:data})

		
	}catch(error){
		res.status(400).json({result:"false",message:error.message})
	}

};



const allBetUsersList=async(req,res)=>{

	try{
		const {matchId}=req.body;
		if(!matchId){
			return res.status(400).json({result:"false",message:"required field is matchId"})
		}
		const datas=await Bets.find({matchId}).populate('userId');
		if(!datas){
			res.status(400).json({result:"false",message:"Invalid matchId"})
		}
		
		const data= await datas.map(item=>({
			betsId:item._id,
			uniqueName:item.userId.uniqueName,
            userName:item.userId.userName,
            userProfile:item.userId.userProfile || '',
           outcome:item.outcome,
            amount:item.amount,
            matched:item.matched,
            status:item.status,
		
		}));
		res.status(200).json({result:"true",message:"Match details got sucessfully",data:data})

		
	}catch(error){
		res.status(400).json({result:"false",message:error.message})
	}

};



/*........................matches end operation.................... */
const dashboardData_api = async (req, res) => {
	try {
	  const userCount = await User.countDocuments({});
	  const appComission = await Comission.find({});
	  const totalAppCommission = appComission.reduce((sum, item) => sum + item.appComission, 0);
  
	  // Ensure all countDocuments calls use 'await'
	  const verifiedCoordinatorCount = await Coordinator.countDocuments({ coordinatorStatuse: 1 });
	  const coordinatorCount = await Coordinator.countDocuments({});
	  const liveMatchCount = await Match.countDocuments({ matchStatus: "Live" });
	  const completedMatchCount = await Match.countDocuments({ matchStatus: "Completed" });
	  const cancelledMatchCount = await Match.countDocuments({ matchStatus: "Abodon" });
	  const upcomingMatchCount = await Match.countDocuments({ matchStatus: "Upcoming" });
  
	  const data = {
		userCount,
		totalAppCommission,
		verifiedCoordinatorCount,
		coordinatorCount,
		liveMatchCount,
		completedMatchCount,
		cancelledMatchCount,
		upcomingMatchCount, // Fixed variable name (camelCase convention)
	  };
  
	  res.status(200).json({ result: "true", message: "Dashboard data retrieved successfully", data });
	} catch (err) {
	  res.status(400).json({ result: "false", message: err.message });
	}
  };
  


  

/*....................exports variables...........*/
module.exports = {
	
	// category
	createCategory,
	getCategory,
	updateCategory,
	getCategory_byId,
	activeDeactive_category,
	deleteCategory,
	
	// customer 
	customerList,
	userBlock_unblock_api,
	customerDetails,


	//pulicy
	create_privacyPolicy,
	privacy_list,
	create_contactUs,
	contactUs_list,
	create_about_us,
	aboutUs_list,
	AdminSignup,
	AdminLogin,

	//coordinator
   coordinatorList,
   coordinatorBlock_unblock_api,
   coordinatorDetails,
   coordinatorApprove_api,
	
   //match related
   matcheLists,
   matchDetails,
   allBetUsersList,
   dashboardData_api,
   
	
	


};