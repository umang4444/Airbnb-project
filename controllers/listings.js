


const axios = require("axios");
const Listing = require("../models/listing");

module.exports.index=async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm=(req,res) =>{
    res.render("listings/new.ejs");
};

module.exports.showListing = async (req,res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        req.flash("error", "Listing does not exist!");
        return res.redirect("/listings"); // ✅ RETURN ADDED
    }

    res.render("listings/show.ejs", { listing });
};


module.exports.createListing = async (req, res) => {
    // Safety check (important)
    if (!req.file) {
        req.flash("error", "Image upload failed. Please try again.");
        return res.redirect("/listings/new");
    }

    const newListing = new Listing(req.body.listing);

    // ✅ Cloudinary image
    newListing.image = {
        url: req.file.path,
        filename: req.file.filename,
    };

    newListing.owner = req.user._id;

    await newListing.save();

    req.flash("success", "New Listing is Created");
    res.redirect(`/listings/${newListing._id}`);
};




  module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
     if(!listing) {
      req.flash("error","Listing does not exist!");
      res.redirect("/listings");
     }
    res.render("listings/edit.ejs", { listing });
  };

 module.exports.updateListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);

    listing.title = req.body.listing.title;
    listing.description = req.body.listing.description;
    listing.price = req.body.listing.price;
    listing.location = req.body.listing.location;
    listing.country = req.body.listing.country;

    if (typeof req.file !== "undefined") {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    await listing.save();
    req.flash("success", "Listing is Updated");
    res.redirect(`/listings/${id}`);
};


  module.exports.destroyListing=async (req,res) => {
     let { id } = req.params;
  const deleteListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing is Deleted!");
  res.redirect("/listings");
};