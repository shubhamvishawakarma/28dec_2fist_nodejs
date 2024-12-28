const mongoose=require('mongoose');
const liveSchema=new mongoose.Schema({
    matchId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    coordinatorId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    token:String,
    channelName:String,
    uid:Number,


});
 module.exports =mongoose.model('live',liveSchema);