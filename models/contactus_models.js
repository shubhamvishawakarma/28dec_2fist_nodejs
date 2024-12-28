// import dependancy
const mongoose=require("mongoose");
const contact_usSchema=new mongoose.Schema({
    location:{
        type:String
    },
    phone_no:{
        type:String
    },
    email:{
        type:String
    },
    whatsapp_number:{
        type:String
    },
    type:{
        type:Number,
        default:1
    },

});
// export about_us schema from here
module.exports=contactModel=mongoose.model("contactus",contact_usSchema);