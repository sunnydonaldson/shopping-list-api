require("dotenv").config()
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors())

app.get("/",function(req,res){
    console.log("requested");
    res.send({status:"good"});
})

app.listen(9000,function(){
    console.log("the server is up on port 9000");
});