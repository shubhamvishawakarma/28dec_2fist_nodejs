/*...............import dependancies..............*/
const express =require("express");
const router=express();
const multer=require('multer');


//import auth middleware
const auth=require("../middleware/userTokenHandler");


// use multer
const storage=multer.diskStorage({
	destination:"uploads",
	filename:(req,file,cb)=>{
		cb(null,file.originalname);
	},

});


  const upload=multer({
	storage:storage,
	fileFilter:function(req,file,callback){
		if(file.mimetype == "image/png" ||
                 file.mimetype == "image/jpg" ||
                 file.mimetype == "image/jpeg"||
                 file.mimetype == "text/csv"  ||
				 file.mimetype == "application/pdf" ||
				 file.mimetype == "audio/mpeg" || 
				 file.mimetype == "video/mp4" 
			){
			callback(null,true)
		}else{
			console.log('only  png , jpg & jpeg,csv file supported')
                     callback(null,false)
		}
	},
	limits:{
		 filesize:100000000000 //1000000 bytes=1MB
   }


});
  
 

/*............import user_controllers.........*/
const userControllers=require("../controllers/user_controller");



/*..........set user controllers url...........*/
router.post("/userSignup",upload.single('userProfile'),userControllers.userSignupApi);
router.post("/userLogin",userControllers.userLoginApi);
router.post("/forgotPassword",userControllers.forgotPassword);
router.post("/resetPassword",userControllers.resetPassword);
router.post("/updateUser_profile",upload.single('userProfile'),userControllers.updateUser_profile);
router.post("/getUser_profile",userControllers.getUser_profile);
router.get("/category_list",userControllers.category_list);
router.get("/support_list",userControllers.support_list);
router.get("/aboutus_list",userControllers.aboutus_list);
router.post("/addUserAmount",userControllers.addUserAmount);
router.post("/coordinatorSignup",upload.single('coordinatorProfile'),userControllers.coordinatorSignupApi);
router.post("/coordinatorLogin",userControllers.coordinatorLoginApi);
router.post("/coordinatorForgotPassword",userControllers.coordinatorForgotPassword);
router.post("/coordinatorResetPassword",userControllers.coordinatorResetPassword);
router.post("/updateCoordinatorProfile",upload.single('coordinatorProfile'),userControllers.updateCoordinatorProfile);
router.post("/getCoordinatorProfile",userControllers.getCoordinatorProfile);
router.post("/createMatch",upload.fields([
    { name: 'logo1', maxCount: 1 },
    { name: 'logo2', maxCount: 1 }
  ]),userControllers.createMatch);
router.post("/MatchList",userControllers.MatchList);
router.post("/coordinatorTeamList",userControllers.coordinatorTeamList);
router.post("/updateCoordinatorComission",userControllers.updateCoordinatorComission);
router.post("/coordinatorDashboardCount",userControllers.coordinatorDashboardCount);
router.post("/coordinatorComissionList",userControllers.coordinatorComissionList);
router.post("/coordinatorTransjectionList",userControllers.coordinatorTransjectionList);
router.post("/updateCoordinatorTeamList",upload.fields([
    { name: 'logo1', maxCount: 1 },
    { name: 'logo2', maxCount: 1 }
  ]),userControllers.updateCoordinatorTeamList);
  

router.post("/unmatchedBetList",userControllers.unmatchedBetList);
router.post("/MatchDetails",userControllers.MatchDetails); 
router.post("/searchingBet",userControllers.searchingBet); 
router.post("/updateMatcheStatus",userControllers.updateMatcheStatus);
router.post("/updateMatcheResult",userControllers.updateMatcheResult);
router.post("/findingMatched_bet",userControllers.findingMatched_bet);
router.post("/sendBet_request",userControllers.sendBet_request);
router.post("/MatchedBet_userDetails",userControllers.MatchedBet_userDetails);
router.post("/getBet_request",userControllers.getBet_request);
router.post("/userTranjectionList",userControllers.userTranjectionList);
router.post("/acceptBetRequest",userControllers.acceptBetRequest);
router.post("/userBetsList",userControllers.userBetsList);
router.post("/userWithdrawRequest",userControllers.userWithdrawRequest);
router.post("/userWithdrawList",userControllers.userWithdrawList);
router.post("/goLive",userControllers.goLive);

/*..............export router..................*/
module.exports=router;