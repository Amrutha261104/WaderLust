// const mongoose = require("mongoose");
// const Schema = mongoose.Schema;
// const review = require("./review.js");

// const listingSchema = new Schema({
//     title: {
//         type: String,
//         requied: true,
//     },
//     description: String,
//     image: {
//         url: String,
//         filename: String,
        
//     },
//     price: Number,
//     location: String,
//     country: String,
//     reviews: [
//         {
//             type: Schema.Types.ObjectId,
//             ref: "Review",
//         },
//     ],
//     owner: {
//         type: Schema.Types.ObjectId,
//         ref: "User",
//     },
    
// });

// listingSchema.post("findOneAndDelete",async (listing) =>{
//     if(listing) {
//         await review.deleteMany({ _id: { $in: listing.reviews} });
//     }
// });

// const Listing= mongoose.model("Listing", listingSchema);
// module.exports = Listing;



const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        url: {
            type: String,
            default: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        },
        filename: {
            type: String,
            default: "default",
        },
    },
    price: {
        type: Number,
        min: 0,
    },
    location: String,
    country: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        },
    ],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if (listing) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});

module.exports = mongoose.model("Listing", listingSchema);
