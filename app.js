if(process.env.NODE_ENV !="production") {
   require("dotenv").config();
}


const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path =require("path");
const methodOverride=require("method-override");
const ejsMate= require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const Review = require("./models/review.js");
const session = require("express-session");
const {MongoStore} = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/users.js");

const listingsrouter = require("./routes/listing.js");
const reviewsrouter = require("./routes/review.js");
const userrouter = require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL;

main()
.then(() => {
    console.log("connected to DB");
})
.catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

const store = new MongoStore({
    mongoUrl:dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,          // interval in sec between session update
});

store.on("error", (err) =>{
    console.log("ERROR IN MONGO SESSION STORE",err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET ,  //a scret code
    resave: false,  //required parameters
    saveUninitialized: true ,
    cookie: {        // main use of cookie is to track sessions
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,  // expires after 7 days
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days * 24 hours * 60 mins * 60 sec * 1000 millisecs
        httpOnly: true,
    },
};

// app.get("/", (req,res) => {
//     res.send("hi,i am root");
// });



app.use(session(sessionOptions)); // for usage of session , where 1st we go to session nd later with sessionOptions
app.use(flash());

app.use(passport.initialize());   // a middleware used to initialize passprt
app.use(passport.session()); 

passport.use(new LocalStrategy(User.authenticate()));   //use static authenticate method of model in lcalstrategy
passport.serializeUser(User.serializeUser());    // to serialize &deserialize users into the session
passport.deserializeUser(User.deserializeUser());
 

app.use((req,res,next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

// app.get("/demouser", async(req,res) =>{
// let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "delta-student"
// });
  
// let registeredUser =await User.register(fakeUser, "helloworld");
// res.send(registeredUser);
// });

app.use("/listings", listingsrouter); //instead of listing routes here we present only this line
app.use("/listings/:id/reviews",reviewsrouter); // same uuse case as abv
app.use("/", userrouter);


app.use((req,res) =>{
    res.status(404).send("page not found");
});


app.use((err,req,res,next) =>{
    let { statusCode = 500, message = "something went wrong" } = err;
    res.status(statusCode).render("error.ejs",{ message });
    
});

// app.listen(8080, () => {
//     console.log("server listening to port 8080");
const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`server listening on port ${port}`);
});

  

