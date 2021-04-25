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

mongoose.connect("mongodb+srv://abhishek_0504:9971749520a@cluster0-b6e9z.mongodb.net/HelloWorldDB", {useNewUrlParser: true ,useFindAndModify: false , useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const forumSchema = new mongoose.Schema ({
  name : String,
  description : String,
  current : String,
  time: String,
  topic: String,
  labels: Array,
  body: String,
  upvotes: Number,
  downvotes: Number
});

const ansSchema = new mongoose.Schema ({
  name : String,
  description : String,
  current : String,
  time: String,
  body: String,
  upvotes: Number,
  downvotes: Number,
  quesId: String
});

const userSchema = new mongoose.Schema ({
  email: String,
  password: String,
  googleId: String,
  lastLogin : String,
  name : String,
  number : String,
  description : String,
  current : String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
forumSchema.plugin(findOrCreate);

const User = new mongoose.model("User", userSchema);
const Forum = new mongoose.model("Forum", forumSchema);
const Ans = new mongoose.model("Ans" , ansSchema);


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
  res.render("home/home");
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
  res.render("registration/registration")
})

app.get("/register", function(req, res){
  res.render("registration/registration");
});

app.get("/secrets", function(req, res){
  console.log(':::::::::::::::::::::');
  console.log(req);
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



app.post("/register", function(req, res){
  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  User.register({
    username: req.body.username , 
    number: req.body.contact,
    description: req.body.description,
    current: req.body.occupation,
    lastLogin : dateTime , 
    name:req.body.name 
  }, req.body.password, function(err, user){
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

app.post("/AskAQues", (req, res)=>{

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  let ques = new Forum({
    description: req.user.description,
    current: req.user.current,
    name:req.user.name ,
    time: dateTime,
    topic: req.body.topic,
    labels: req.body.labels,
    body: req.body.body,
    upvotes: 0,
    downvotes: 0
  })
  ques.save()
   .then(doc => {
     console.log(doc)
   })
   .catch(err => {
     console.error(err)
   })

  console.log(req);
});

app.post('/answer/:quesId',(req,res)=>{

  var today = new Date();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var dateTime = date+' '+time;

  let ans = new Ans({
    description: req.user.description,
    current: req.user.current,
    name:req.user.name ,
    time: dateTime,
    body: req.body.body,
    upvotes: 0,
    downvotes: 0,
    quesId: req.params.quesId
  })
  ans.save()
   .then(doc => {
     console.log(doc)
   })
   .catch(err => {
     console.error(err)
   })


  res.redirect('/forum');
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



// Webpages
app.get("/home",(req,res)=>{
  res.render('home/home');
})
app.get("/institute", (req, res)=>{
  res.render("institute/institute");
});

app.get("/AskAQues", (req, res)=>{
  console.log(req);
  res.render("forum/askaques");
});

app.get('/internship',(req,res)=>{
  res.render('internship/internship');
});

app.get('/placement',(req,res)=>{
  res.render('placement/placement');
});

app.get("/forum", (req, res)=>{

  let data;

  Forum
  .find()
  .then(doc => {
    console.log("$$$$$$$$$$$$");
    data=doc
    res.render("forum/forum" , {body: data});
    console.log(doc)
  })
  .catch(err => {
    console.error(err)
  })

});

app.get('/registration',(req,res)=>{
  res.render('registration/registration');
});

app.get('/answer/:quesId',(req,res)=>{

  Ans
  .find({
    quesId:  req.params.quesId // search query
  })
  .then(doc => {
    console.log("&*&**&*&*&*&*&*&*&*&*&*&*&*&*&*&*&");
    console.log(doc)
    res.render('forum/answer' , {link: req.params.quesId , body: doc});
  })
  .catch(err => {
    console.error(err)
  })
});

app.listen(port, function() {
  console.log("Server started on port 3000.");
});
