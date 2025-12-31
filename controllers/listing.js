const Listing = require("../models/listing");

module.exports.index = async (req,res) => {
   const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    const listing =  await Listing.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    if(!listing) {
        req.flash("error","listing you requested for doesnot exists");
        res.redirect("/listings");
    }
    
    res.render("listings/show.ejs", {listing});
};

module.exports.createListing = async(req,res ,next)=>{
    let url = req.file.path; //for ectype for image uploade instead url upload
    let filename = req.file.filename;
    const newlisting=new Listing(req.body.listing);
    newlisting.owner = req.user._id;
    newlisting.image = {url,filename};
   await newlisting.save();
   req.flash("success", "New LIsting Added");  // sucess is the key and msg to be displayed is new listing added
   res.redirect("/listings");
 
};

module.exports.renderEditForm = async(req,res)=>{
    let {id} = req.params;
    const listing =  await Listing.findById(id);
    if(!listing) { // if listing doesnot exist then this if loop runs instead throwing error
        req.flash("error","listing you requested for doesnot exists");
        res.redirect("/listings");
    }
     let originalImageUrl = listing.image.url;
     originalImageUrl.replace("/upload","/upload/w_250");
    res.render("listings/edit.ejs",{listing,originalImageUrl});

};

module.exports.updateListing =  async(req,res)=>{
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof ref.file !=="undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = {url,filename};
        await listing.save();
    }
     req.flash("success", "a listing updated"); 
     res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res)=>{
     let {id} = req.params;
     const deletedListing=await Listing.findByIdAndDelete(id);
     console.log(deletedListing);
     req.flash("success", "a listing deleted"); 
     res.redirect("/listings");

};