const mongoose=require('mongoose');
const transjectionSchema=new mongoose.Schema({
    coordinatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"coordinator"
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    transjectionId:String,
    amount:String,
    tranjectionType:String,
    status:String,
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "match"
    }
    
   

},{timestamps:true});

module.exports=mongoose.model("transjection",transjectionSchema);