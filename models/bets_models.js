const mongoose=require("mongoose");
const betsSchema=new mongoose.Schema({
    matchId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"match"
    },
    coordinatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"coordinator"
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    competitionId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    outcome:String,
    amount:Number,
    winning_amount:Number,
    matched:{
       type:Boolean,
       default:false
    },
    status:{
        type:Number,
        default:0
     },
    
   
},{timestamps:true});
module.exports=mongoose.model("bet",betsSchema);
