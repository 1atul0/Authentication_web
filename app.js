require("dotenv").config(); //for stroring security things
const express = require("express"); //for makeing webapp
const ejs = require("ejs"); //for rendering dynamic content
const bodyParser = require("body-parser"); //for using hadle data from form
const mongoose = require("mongoose"); //for using database
const session = require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");


const app = express();
// console.log(process.env.API_KEY);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret:"Our little secret key.",
  resave:false,
  saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

//connect to localdatabase
mongoose
  .connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true })
  .then(() => console.log("connected to userDB database"))
  .catch((err) => console.error(err));

//making schema
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose);

//make model
const User = new mongoose.model("User", userSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/logout",function(req,res){
  res.logout();
  res.redirect("/");
})

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()){
    res.render("secrets");
  }
  else{
    res.redirect("/login");
  }
});


app.post("/register", function (req, res) {
  User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else
    {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      })
    }
  })
});

app.post("/login", function (req, res) {
  const user=new User({
    username:req.body.username,
    password:req.body.password,
  });
  req.login(user,function(err){
    if(err){
      console.log(err);
    }else
    {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  })
  
});

//check that server is listen or not
app.listen(3000, function () {
  console.log("server started at port 3000");
});
