const mongoose=require('mongoose');
const comissionSchema=new mongoose.Schema({
    coordinatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"coordinator"
    },
    matchId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"match"
    },
    appComission:Number,
    coordinatorComission:Number,
    totalPot:Number,
   

},{timestamps:true});

module.exports=mongoose.model("comission",comissionSchema);