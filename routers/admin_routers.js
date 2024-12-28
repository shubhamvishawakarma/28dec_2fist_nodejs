/*...............import dependancies..............*/
const express =require("express");
const router=express();
const multer=require('multer');


/*....................import middleware...........*/
const auth=require("../middleware/adminAuth");


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
                 file.mimetype == "application/pdf" ||
				 file.mimetype == "video/mp4" ||
				 file.mimetype == "audio/mpeg" 

			){
			callback(null,true)
		}else{
			console.log('only  png , jpg & jpeg,csv file supported')
                     callback(null,false)
		}
	},
	limits:{
		 filesize:500000000000 //1000000 bytes=1MB
   }


});
  
 



/*............import user_controllers.........*/
const adminControllers=require("../controllers/admin_controller");


//url setup
router.post("/create_aboutUs",auth,adminControllers.create_about_us);
router.get("/aboutUs_list",auth,adminControllers.aboutUs_list);
router.post("/create-pulicy",auth,adminControllers.create_privacyPolicy);
router.get("/privacy_list",auth,adminControllers.privacy_list);

// contact us url
router.post("/create_contactUs",auth,adminControllers.create_contactUs);
router.get("/contactUs_list",auth,adminControllers.contactUs_list);

// category url setup
router.post("/createCategory",auth,upload.single('category_image'),adminControllers.createCategory);
router.post("/updateCategory",auth,upload.single('category_image'),adminControllers.updateCategory);
router.get("/getCategory",auth,adminControllers.getCategory);
router.post("/getCategory_byId",auth,adminControllers.getCategory_byId);
router.post("/activeDeactive_category",auth,adminControllers.activeDeactive_category);
router.post("/deleteCategory",auth,adminControllers.deleteCategory);

// admin url
router.post("/AdminSignup",auth,adminControllers.AdminSignup);
router.post("/AdminLogin",auth,adminControllers.AdminLogin);

//customer list url
router.get("/customerList",auth,adminControllers.customerList);
router.post("/userBlock_unblock_api",auth,adminControllers.userBlock_unblock_api);
router.post("/customerDetails",auth,adminControllers.customerDetails);

//customer list url
router.get("/coordinatorList",auth,adminControllers.coordinatorList);
router.post("/coordinatorBlock_unblock_api",auth,adminControllers.coordinatorBlock_unblock_api);
router.post("/coordinatorDetails",auth,adminControllers.coordinatorDetails);
router.post("/coordinatorApprove_api",adminControllers.coordinatorApprove_api);
// match related url
router.get("/matcheLists",adminControllers.matcheLists);
router.post("/matchDetails",adminControllers.matchDetails);
router.post("/allBetUsersList",adminControllers.allBetUsersList);
router.get("/dashboardData_api",adminControllers.dashboardData_api);



/*..............export router..................*/
module.exports=router;
