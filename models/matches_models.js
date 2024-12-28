const mongoose=require("mongoose");
const matchSchema=new mongoose.Schema({
    categoryId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"category"
    },
    coordinatorId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"coordinator"
    },
    leagueName:String,
    teamName1:String,
    teamName2:String,
    logo1:String,
    logo2:String,
    sortName1:String,
    sortName2:String,
    start_date:String,
    expire_date:String,
    start_time:String,
    expire_time:String,
    matchStatus:{
        type:String,
        default:"Upcoming"
    },
    winnerTeam:String
   
},{timestamps:true});
module.exports=mongoose.model("match",matchSchema);
