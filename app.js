require("dotenv").config()
const passport = require("passport");
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

mongoose.connect(`mongodb+srv://sunny-admin:${process.env.ADMIN_PASSWORD}@cluster0.2qq4y.mongodb.net/shopping-list?retryWrites=true&w=majority`,{useNewUrlParser:true});


//----------------------------saving to mongodb-------------------------------//
const listSchema = new mongoose.Schema({
    user:String,
    username:String,
    list:Array,

})
const List = mongoose.model("List",listSchema);

const list = new List({
    user:"123dkjf",
    username:"test",
    list:["cake","banana","unicorn","eggs","milk"]
})

// list.save();


//------------------------reading from database-----------------------------//

List.find(function(err,lists){
    if(err){
        console.log(err);
    }else{
        console.log(lists);
    }
});


const app = express();
app.use(cors())

// passport.use(new GoogleStrategy({
//     clientID: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//     callbackURL: "http://localhost:9000/auth/google/shopping"
//   },
//   function(accessToken, refreshToken, profile, done) {
//        User.findOrCreate({ googleId: profile.id }, function (err, user) {
//          return done(err, user);
//        });
//   }
// ));



app.get("/",function(req,res){
    console.log("requested");
    res.send({status:"good"});
})

app.listen(9000,function(){
    console.log("the server is up on port 9000");
});