//import dependacy
const mongoose=require("mongoose");
const categorySchema=new mongoose.Schema({
    category_image:{
        type:String
    },
    acrtive_status:{
        type:Number,
        default:0
    },
    categoryName:{
        type:String
    },
   
});
module.exports=categoryModel=mongoose.model("category",categorySchema);