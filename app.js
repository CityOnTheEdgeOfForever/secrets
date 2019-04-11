//jshint esversion:6

require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

app.set('view engine', 'ejs');



const dbName = 'userDB';
const url1 = "mongodb://localhost:27017/"; //connect to local mongodb

const url3 = url1 + dbName;

mongoose.connect(url3, {
  useNewUrlParser: true
});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const secret = process.env.SECRET;

userSchema.plugin(encrypt, {
  secret: secret,
  encryptedFields: ['password']
});

const User = mongoose.model("User", userSchema);

app.route("/")
  .get(function(req, res) {
    res.render("home");
  });

app.route("/login")
  .get(function(req, res) {
    res.render("login");
  })
  .post(function(req, res) {
    User.findOne({
      email: req.body.username
    }, function(err, result) {
      if (err === null && result != null) {
        if (result.password === req.body.password) {
          res.render("secrets");
        } else {
          const mesg = "password does not match";
          res.render("browserMesg", {
            mesg: mesg
          });
        }
      } else {
        const mesg = err;
        res.render("browserMesg", {
          mesg: mesg
        });
      }
    });
  });

app.route("/register")
  .get(function(req, res) {
    res.render("register");
  })
  .post(function(req, res) {
    const doc = new User({
      email: req.body.username,
      password: req.body.password
    });
    doc.save(function(err) {
      if (err === null) {
        const mesg = "following doc was saved: " + doc;
        res.render("browserMesg", {
          mesg: mesg
        });
      } else {
        const mesg = "error occurred: " + err;
        res.render("browserMesg", {
          mesg: mesg
        });
      }
    });
  });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started");
});
