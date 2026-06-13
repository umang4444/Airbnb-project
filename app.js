
if(process.env.NODE_ENV != "production") {
    require("dotenv").config();
};


const express = require("express");
const app = express();
const path = require("path");
const ExpressError = require("./utils/ExpressError.js");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const  ejsMate = require("ejs-mate");
const session = require("express-session");
const mongoStore=require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");



app.engine('ejs', ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const listings =require("./routes/listing.js");
const reviews =require("./routes/review.js");
const user =require("./routes/user.js");
const dbUrl=process.env.ATLASDB_URL;

main()
.then( () => {
    console.log("connected to db");
})
.catch((err) => { 
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
};


app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "/public")));

const MongoStore = require("connect-mongo");

const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    crypto: {
        secret: process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 3600, 
});

store.on("error",(err) => {
    console.log("error in mongo session",err);
});


const sessionOptions = {
    store,
    secret :  process.env.SESSION_SECRET,
    resave : false ,
    saveUninitialized : true,
    cookie : {
        expires : Date.now() + 7 * 24 * 60 * 60 * 1000 ,
        maxAge: 7 * 24 * 60 * 60 * 1000 ,
        httpOnly : true ,
    },
};



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use( (req,res,next) => {
    res.locals.success = req.flash("success");
     res.locals.error = req.flash("error");
     res.locals.currUser = req.user ;
    next();
});


// app.get("/", (req,res) => {
//     res.send("Hi, I am Root"); 
// });

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);
app.use("/",user);


app.get("/", (req, res) => {
    res.redirect("/listings");
});



// app.get("/testListing", async (req,res) => {
//    let sampleListing = new Listing({
//     title: "my new Villa",
//     description: "by the beach",
//     price: 1200,
//     location: "goa",
//     country: "India",
//    });
//    await sampleListing.save();
//    console.log("sample was saved");
//    res.send("sucessful testing");
// });

// 404 handler (Express 5 safe)
app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

// error handler
app.use((err, req, res, next) => {
    console.log("🔥 ERROR MESSAGE:", err?.message);
    console.log("🔥 ERROR STACK:\n", err?.stack);

    const statusCode = err?.statusCode || 500;
    res.status(statusCode).render("error.ejs", { err });
});






const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
   console.log(`server is active on port ${PORT}`);
});