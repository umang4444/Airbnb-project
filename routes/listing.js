const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js")
const Listing = require("../models/listing.js");
const { isLoggedIn,isOwner,validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudinary.js");
const upload = multer({ storage });





//index route
router.get("/", wrapAsync(listingController.index));


///new route
router.get("/new" ,isLoggedIn ,listingController.renderNewForm );


////show route
router.get("/:id" ,  wrapAsync(listingController.showListing));


//creat route
// router.post(
//   "/",isLoggedIn,
//   validateListing,
//   wrapAsync(listingController.createListing)
// );
router.post(
  "/",
  isLoggedIn,
  upload.single("image"),
  validateListing,
  wrapAsync(listingController.createListing)
);


//edit
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.renderEditForm));


//update
router.put(
  "/:id",isLoggedIn,isOwner,validateListing, upload.single("listing[image][url]"),
  
  wrapAsync(listingController.updateListing)
);


//delet
router.delete("/:id",isLoggedIn,isOwner, wrapAsync(listingController.destroyListing));


module.exports = router;