const express=require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const encrypt=require("mongoose-encryption");

const app=express();

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));


//connect to localdatabase
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true})
.then(()=>console.log("connected to userDB database"))
.catch((err)=>console.error(err));

//making schema
const userSchema=new mongoose.Schema({
  email:String,
  password:String
});

const secret="Thisisourlittlesecret.";
userSchema.plugin(encrypt,{secret:secret,encryptedFields:["password"]});
//make model
const User=new mongoose.model("User",userSchema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
  const newUser=new User({
    email:req.body.username,
    password:req.body.password,
  });

  newUser.save()
  .then(()=>{
    console.log("successfully registered");
    res.render("secrets");
  })
  .catch((err)=>console.error(err));


});

app.post("/login",function(req,res){
  const username=req.body.username;
  const password=req.body.password;
  User.findOne({email:username})
  .then((foundUser)=>{
    if(foundUser){
      if(foundUser.password===password)     
      {
        res.render("secrets");
      }
      else{
        // res.write("wrong password please try again");
        res.render("login");
      }
    }
    else{
      // res.write("no user found.please first signup");
      res.render("register");
    }
  })
  .catch((err)=>console.error(err));
});




app.listen(3000,function(){
  console.log("server started at port 3000");
})