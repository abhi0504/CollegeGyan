require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');

const app = express();



app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: "Our little secret.",
  resave: false,
  saveUninitialized: false
}));

let email = ""

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://abhishek_0504:9971749520a@cluster0-b6e9z.mongodb.net/userDB", {useNewUrlParser: true ,useFindAndModify: false , useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  lastLogin : String,
  name : String,
  permission : Boolean
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});



passport.use(new GoogleStrategy({
    clientID:"289206322346-6i0t5jt43tjff1et7cui5n2q10grk2bi.apps.googleusercontent.com",
    clientSecret:"qyr1qRZGSjAfqttDnf0Jo4x-",
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

app.get("/", function(req, res){
  res.render("login/home");
});

app.get("/auth/google",
  passport.authenticate('google', { scope: ["profile"] })
);

app.get("/auth/google/secrets",
  passport.authenticate('google', { failureRedirect: "/login" }),
  function(req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  });

app.get("/login", function(req, res){
  res.render("login/login");
});

app.get("/admin" , function(req,res)
{
  res.render("login/admin")
})

app.get("/List-of-users" , function(req,res)
{
    User.find({}, function(err, foundUsers){
      if (err){
        console.log(err);
      } else {
        if (foundUsers) {
          res.render("List-of-users", {foundUsers: foundUsers});
        }
      }
    });

});

app.get("/register" , function(req,res)
{
  res.render("login/register")
})

app.get("/register", function(req, res){
  res.render("login/register");
});

app.get("/secrets", function(req, res){
  User.find({username:email}, function(err, foundUsers){
    if (err){
      console.log(err);
    } else {
      if (foundUsers) {
      [{name,username}] = foundUsers;
        res.render("login/secrets" , {name : name , username :username});
      }
    }
  });
});

app.get("/logout", function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/blocked" , function(req,res)
{
  req.logout();
  res.render("login/blocked")
})

app.get("/disable" , function(req , res)
{
  res.render("login/disable")
});


app.get("/added" , function(req,res)
{
  res.render("login/added")
})

app.get("/cdisable" , function(req , res)
{
  res.render("login/cdisable")
})

app.post("/disable" , function(req , res)
{
  const un = req.body.username;
  if(un === "admin@123.com")
  {
    res.redirect("cdisable")
  }

  else{

    var myquery = { username: un };
    var newvalues = { $set: { permission: false } };

     User.findOneAndUpdate(myquery,newvalues, function(err, user)
  {
    if(err)
    {
      console.log(err);
    }
    else{
          res.redirect("disable")
    }
  })

  }

})

app.get('/internship',(req,res)=>{
  res.render('internship/internship');
})

app.post("/register", function(req, res){
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  User.register({username: req.body.username , lastLogin : dateTime , name:req.body.name , permission: true}, req.body.password, function(err, user){
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function(){
        res.redirect("/added");
      });
    }
  });

});

app.post("/login", function(req, res){
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  email = req.body.username

  const user = new User({
    username: req.body.username,
    password: req.body.password,
    lastLogin : dateTime
  });

  req.login(user, function(err){
    if (err) {
      console.log(err);
    } else {

User.find({username:req.body.username} , function(err , founduser)
{
  if(err)
  {
    console.log(err);
  }
  else
  {

      const[{username,permission,lastLogin}] = founduser;

    var myquery = { username: username };
    var newvalues = { $set: { lastLogin: dateTime } };
   User.findOneAndUpdate(myquery,newvalues, function(err, user)
  {
    if(err)
    {
      console.log(err);
    }
    else{
      console.log(user);
    }
  })

          if(permission === false)
          {
            res.redirect("/blocked")
          }
          else
          {
            passport.authenticate("local")(req, res, function(){



              if(req.body.username === "admin@123.com")
              {
                res.redirect("/admin")
              }
              else
              {
                res.redirect("/secrets");
              }
            });
          }
  }
});
    }
  });

});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000.");
});
