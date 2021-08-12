require("dotenv").config()
const passport = require("passport");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");
const bodyParser = require("body-parser");
const session = require("express-session");


const app = express();

// specifies a public directory for things like Stylesheets
app.use(express.static('public')); 
app.use(express.json())
app.use(bodyParser());


// sets up a session using the secret key retrieved from the environment variables
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cooke:{secure:false}
}));

app.use(passport.initialize());
app.use(passport.session());

//sets the user ID as a cookie in the browser
passport.serializeUser(function(user, done) {
  done(null, user._id);
});

//retrieves the user ID from the cookie in order to access the users data
passport.deserializeUser(function(_id, done) {
  User.findById(_id, function(err, user) {
    return done(err, user);
  });
});


//enable cross origin resource sharing to enable the api to be accessed from other origins (domains)
app.use(cors({credentials: true, origin: 'http://localhost:3000',optionsSuccessStatus:200}))

//connecting to the MongoDB atlas database, using the password stored as an environment variable
mongoose.connect(`mongodb+srv://sunny-admin:${process.env.ADMIN_PASSWORD}@cluster0.2qq4y.mongodb.net/shopping-list?retryWrites=true&w=majority`,{useNewUrlParser:true});
mongoose.set("useCreateIndex", true); 





//defining a schema for the user documents so we know which fields to expect, and what their datatypes are
const userSchema = new mongoose.Schema({
    user:String,
    googleId:String,
    username:String,
    list:Array,

})

//plugs in the findOrCreate function to the userSchema, which provides an easy way for us to search for something,
//and create it if it doesn't exist
userSchema.plugin(findOrCreate)



const User = mongoose.model("User",userSchema);

//sets up authentication with google
passport.use(new GoogleStrategy({
  //gets the clientID and clientSecret from the environment variables
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,

  //redirects to this route once complete
  callbackURL: "http://localhost:9000/auth/google/callback",
  userProfileURL:"https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, done) {
  //searches the MongoDB database for a user who's googleId matches the profile ID.
  //It is then retrieved if it exists, or created if it doesn't.
     User.findOrCreate({ googleId: profile.id }, function (err, user) {
       return done(null, user);
     });
}
));












//responds to get request on "/auth/google" by using passport.authenticate, which redirects to the Google sign-in page.
app.get("/auth/google",passport.authenticate('google', { scope: ["profile"], session:true}));


app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:3000',session:true }),
  function(req, res) {
    //redirects the authenticated user to the shopping list page 
    req.session.save(() => {
      res.redirect('http://localhost:3000/shopping');
    })
  });


  app.get("/get-list",function(req,res){
    console.log(req.isAuthenticated())
    //sends the information related to the authenticated user
    if(req.isAuthenticated()){
      res.send(req.user);
    }else{
      res.redirect("http://localhost:3000")
    }
    
  })


//The root route isnt' actually needed, but I set it up to respond with a status message incase someone gets directed here by accident
app.get("/",function(req,res){
    res.redirect("http://localhost:3000");
    res.send({status:"good"});
})


//sets up a route for post requests with updated values for the lists
app.post("/add-item",function(req,res){
  console.log(req.user);
  if(req.isAuthenticated()){
    User.updateOne({_id:req.user._id},{list:req.body.list},function(err){
      if(err){
        //logs the error if there is one
        console.log(err)
      }
    });

  }else{
    res.redirect("http://localhost:3000")
  }

  //updates the users document with the new list sent from the frontend
  
  
})

//sets the server to listen on port 9000 for any requests
app.listen(9000,function(){
    console.log("the server is up on port 9000");
});