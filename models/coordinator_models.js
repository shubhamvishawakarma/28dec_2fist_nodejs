/*............import dependancies.........*/
const mongoose=require("mongoose");
const coordinatorSchema=new mongoose.Schema({
	uniqueName:{
		type:String,
	},
	
	coordinatorName:{
		type:String,
	},
	email:{
		type:String,
	},
	fcmId:{
		type:String,
	},
	password:{
		type:String
	},
	countryName:{
		type:String
	},
	
	coordinatorProfile:{
		type:String
	},
	
	
	coordinatorWallet:{
		type:Number,
	    default:0,
	},
	coordinatorStatus:{
		type:Number,
	    default:0,
	},
	
	activeStatus:{
		type:Number,
	    default:0,
	},
	Status:{
		type:Number,
	    default:0,
	},
	
	gender:{
		type:String,
		
	},
	phone:{
		type:String,
		
	},
	dob:{
		type:String,
		
	},
	comission_percantage:{
		type:Number,
	    default:0,
	},
	

},{timestamps:true});


/*.............exports userSchema from here............*/
module.exports =coordinatorModel=mongoose.model("coordinator",coordinatorSchema);