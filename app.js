require("dotenv").config(); //for stroring security things
const express = require("express"); //for makeing webapp
const ejs = require("ejs"); //for rendering dynamic content
const bodyParser = require("body-parser"); //for using hadle data from form
const mongoose = require("mongoose"); //for using database
// const encrypt=require("mongoose-encryption");//for encrypt password (level 2 encryption)
//other encryption method than mongoose-encryption is md5 which generate hashcode
// const md5=require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const app = express();
// console.log(process.env.API_KEY);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

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

// making encrypt password syntax
// const secret=process.env.SECRET;
// userSchema.plugin(encrypt,{secret:secret,encryptedFields:["password"]});
//make model
const User = new mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.post("/register", function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    //register new user
    //make mongoose object of new user
    const newUser = new User({
      email: req.body.username,
      //password:md5(req.body.password),//it turned my password into hash code and save in
      password: hash,
    });
    //save theat user in db
    newUser
      .save()
      .then(() => {
        console.log("successfully registered");
        res.render("secrets");
      })
      .catch((err) => console.error(err));
  });
});

app.post("/login", function (req, res) {
  //taking username from form
  const username = req.body.username;
  //taking password from form
  const password = req.body.password; //converted  password into hash
  //search user in db
  User.findOne({ email: username })
    .then((foundUser) => {
      // if user find then mathc its password
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          // result == true
          if(result==true){
            console.log("succesfully login");
            res.render("secrets");
          }
          // if password wrong ,then redirect to login page
        else {
          // res.write("wrong password please try again");
          console.log("try again");
          res.render("login");
        }
      });
        
      } else {
        //if user not found
        // res.write("no user found.please first signup");
        console.log("no user found");
        res.render("register");
      }
    })
    .catch((err) => console.error(err));
});

//check that server is listen or not
app.listen(3000, function () {
  console.log("server started at port 3000");
});
