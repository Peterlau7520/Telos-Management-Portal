var express = require('express');
var router = express.Router();
var models = require('../models/models');
var Estate = models.Estate;
var Admin = models.Admin;
var EmailService = require('../services/email')
const Resident = models.Resident;
const Meeting = models.Meeting;
const Poll = models.Poll
var moment = require("moment");

const _ = require('lodash');
let currentDate = moment.utc(new Date());



module.exports = function(passport) {
  // main login routes
  router.get('/meetingManagement', (req,res)=> {
  const promiseArr = []
  const currentMeetings = []
  const pastMeeting = []
  var meetings = []
  Estate.find().populate({
    path: 'currentMeetings',
    model: 'Meeting',
    populate:[{
      path: 'polls',
      model: 'Poll',
    populate:[{
      path: 'votingResults.resident',
      model: 'Resident',
    select:"name shares"
  }]}],
    })
  .populate({
        path: 'pastMeetings',
        model: 'Meeting',
        populate:[{
          path: 'polls',
          model: 'Poll'}]})
  .then(function(estate, err){
    Meeting
    .find()
    .populate('polls')
    .lean().sort({startTime: -1})
    .then(function(meeting, err){
      _.forEach(meeting, function(item){
        var pollEndTime = moment.utc(new Date(item.pollEndTime));
        if(pollEndTime > currentDate || pollEndTime == currentDate){
          //item.pollTime = "Remind"
        }
        else{
          item.pollTime = "Ended"
        }
        if(Date.parse(new Date(item.endTime)) > Date.parse(new Date)){
          item.status = "Current Meeting"
          currentMeetings.push(item)
        }
        else{
          item.status = "Past Meeting"
          pastMeeting.push(item)
        }
      })
      res.render('meeting_management', {upcomingData: currentMeetings, pastData:pastMeeting ,Estate: estate});
    })
  })
})
  router.post('/register', (req, res) => {
    console.log(req.body, "ggggggg")
    Admin.findOne({"email" : req.body.emailAddress}, function(err, admin){
      if(admin){
        res.render('login', {
          flash : "account for this email already exists",
          layout: 'loginLayout.hbs'
        });
      }
      else{
        const secretCode = "#3415"
        if(req.body.secretCode == secretCode){
            let admin = new Admin({
              name: req.body.name,
              account : req.body.username.trim(),
              password : req.body.password.trim(),
              email: req.body.emailAddress.trim(),
            });
            admin.save( (err, adm) => {
              if(err)res.redirect('/error');
              res.render('login', {
              flash : "Account Created",
              layout: 'loginLayout.hbs'
            });
            })
        }
        else{
            res.render('login', {
              flash : "secret code does not match",
              layout: 'loginLayout.hbs'
            });
        }
      }
    })
  })

  router.get('/login', (req,res) => {
    var mess = req.flash('error');
      res.render('login', {
      title: 'Log in',
      flash: mess,
      layout: 'loginLayout.hbs'
    });
  })
  router.get('/', (req,res) => {
    var mess = req.flash('error');
      res.render('login', {
      title: 'Log in',
      flash: mess,
      layout: 'loginLayout.hbs'
    });
  })
    router.get('/verify', (req,res) => {
    console.log(req.body, "hellooo", req.user)
    const body = req.user
      Admin.findOne({account: body.account})
      .then(function(admin, err){
        console.log(admin, "admin")
        if(err) res.send(err);
          if(admin){
          if(admin.password == body.password)
          {
            res.render('login', {
              title: 'Log in',
              flash: "Correct Password",
              account: admin.account,
              layout: 'loginLayout.hbs'
            });
            var otp = Math.floor(1000 + Math.random() * 9000);
            console.log(otp);
            Admin.findOneAndUpdate(
            {account:admin.account},{
              $set: { 
                otp: otp
              }
              },{ 
              new: true 
            })
            .then(function(ad, err){
            EmailService.sendVerificationEmail(admin, otp);
          })
          }
          else
          {
             res.render('login', {
              title: 'Log in',
              flash: "Incorrect Password",
              layout: 'loginLayout.hbs'
            });
          }
        }
        else{
           res.render('login', {
              title: 'Log in',
              flash: "Incorrect username",
              layout: 'loginLayout.hbs'
            });
        }
      })

  })

  router.post('/verified', (req,res) => {
    console.log("hryyy", req.body)
    var body = req.body
    Admin.findOne({account: body.account})
      .then(function(admin, err){
        console.log(admin, "admin")
        if(err) res.send(err);
          if(admin){
          if(admin.otp == body.otp)
          {
             Admin.findOneAndUpdate(
            {account:admin.account},{
              $set: { 
                otp: ''
              }
              },{ 
              new: true 
            })
             .then(function(req, res){
              /*passport.authenticate('local', {
                successRedirect : '/verify',
                failureRedirect : '/login',
                failureFlash : true
              })*/
             
            })
              //res.json({success:true})
             res.redirect('/meetingManagement')
          }
          else{
            res.render('login', {
              title: 'Log in',
              account: admin.account,
              flash: "Incorrect OTP",
              layout: 'loginLayout.hbs'
            });
          }
        }
      })

  })

  router.post('/login', passport.authenticate('local', {
    successRedirect : '/verify',
    failureRedirect : '/login',
    failureFlash : true
  }));
  

  router.get('/logout', (req,res) => {
    req.logout();
    res.redirect('/login');
  })

  return router;
}
