// import dependancy
const mongoose=require("mongoose");
const policySchema=new mongoose.Schema({
    title:{
        type:String
    },
    text:{
        type:String
    },
    type:{
        type:Number,
        default:1
    },
    

});
// export about_us schema from here
module.exports=mongoose.model("privacyPolicy",policySchema);