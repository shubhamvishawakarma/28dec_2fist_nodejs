//import dependacy
const mongoose=require("mongoose");
const adminSchema=new mongoose.Schema({
    email:{
       type:String
    },
    password:{
        type:String
    },
    first_name:{
        type:String
    },
    last_name:{
        type:String
    },
    address:{
        type:String
    },
type:{
    type:Number,
    default:0
},
staff_status:{
    type:Number,
    default:0
},
restrictions: { 
    type: Map,
    of: [String], 
    required: false 
  },

  icons:{
    type:Array
  },

  
},{timestamps:true});

module.exports=adminModel=mongoose.model("admin",adminSchema);