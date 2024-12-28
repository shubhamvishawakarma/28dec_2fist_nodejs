// import dependancy
const mongoose=require("mongoose");
const aboutSchema=new mongoose.Schema({
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
module.exports=aboutModel=mongoose.model("aboutUs",aboutSchema);