const mongoose=require('mongoose');
const withdrawSchema=new mongoose.Schema({
    coordinatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"coordinator"
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    amount:Number,
   
    status:{
        type:String,
        default:"Pending"
    },
    date:String
   

},{timestamps:true});

module.exports=mongoose.model("withdraw",withdrawSchema);