/**
 * This file serves routes for meetingManagement
 * 
 */
const express = require('express');
const forEach = require('async-foreach').forEach;
const dateFormat = require('dateformat');
const router = express.Router();
const models = require('../models/models');
var Busboy = require('busboy');
var Promise = require('bluebird');
const _ = require('lodash');
const busboyBodyParser = require('busboy-body-parser');
const fs = require('fs');
var AWS = require('aws-sdk');
var moment = require("moment");


//AWS
const BucketName = 'telospdf';
AWS.config.update({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.secretAccessKey
});

const bucket = new AWS.S3({params: {Bucket: BucketName}});


//Data models
const Estate = models.Estate;
const Meeting = models.Meeting;
const Poll = models.Poll
router.use(busboyBodyParser({multi: true}));
let currentDate = moment.utc(new Date()); 
router.get('/meetingManagement', (req,res)=> {
  const promiseArr = []
  const currentMeetings = []
  const pastMeeting = []
  var meetings = []
  Estate.find().populate('currentMeetings', 'polls').populate('pastMeetings')
  .then(function(Estate, err){
    console.log(Estate, "estate")
    Meeting.find().populate('polls').lean().sort({startTime: -1})
    .then(function(meeting, err){
      _.forEach(meeting, function(item){
        var endTime = moment.utc(new Date(item.endTime));
         var startTime = moment.utc(new Date(item.startTime));
        item.startTime =  startTime.format("DD/MM/YYYY");
        var pollEndTime = moment.utc(new Date(item.pollEndTime));
        item.startTime =  startTime.format("D/MM/YYYY");
        console.log(item, "item.pollEndTime")
        if(item.pollEndTime > currentDate || item.pollEndTime == currentDate){

          item.pollEndTime = pollEndTime.format("D/MM/YYYY")
          item.pollTime = "Remind"
        }
        else{
          item.pollEndTime = pollEndTime.format("D/MM/YYYY")
          item.pollTime = "Ended"
        }
        if(Date.parse(new Date(item.endTime)) > Date.parse(new Date)){
          item.status = "Current Meeting"
          item.endTime = endTime.format("D/MM/YYYY")
          currentMeetings.push(item)
        }
        else{
          item.endTime = endTime.format("D/MM/YYYY")
          item.status = "Past Meeting"
          pastMeeting.push(item)
        }
      })
      res.render('meeting_management', {upcomingData: currentMeetings, pastData:pastMeeting ,Estate: Estate});
    })
  })
})

router.post('/sendYouTubeLink', (req,res)=>{
  const id = req.body.meetingYoutube
  Meeting.findOneAndUpdate({
      _id: id
    }, {
      $set: { 
        youtubelink: req.body.youtubeLink,
      }
    },{ 
      new: true 
    })
.then(function(meeting, err){
  res.redirect('/meetingManagement')
  if(err) res.send(err);
})
})

router.post('/getPolls', (req,res)=>{
    
    
    
    
})
router.post('/updatePolls', (req,res)=>{
  console.log(req.body, req.files)
  const promiseArr = []
  const fileLinks=[]
  // const poll = [
  // {id: "",
  // options: [{choice: 'yes', percentage: '50'}, {choice: 'no', percentage: '60'}, {choice: 'abstain', percentage: '70'}]
  // },
  // {id: "",
  // options: [{choice: 'yes', percentage: '10'}, {choice: 'no', percentage: '10'}, {choice: 'abstain', percentage: '10'}]
  // }
  // ]
  if(req.files && req.files.file) {
        var files = req.files.file
        for (var i = 0; i < files.length; i++) {
            var info = files[i].data;
            var name = files[i].name.replace(/ /g,'');
            //meeting.fileLinks.push(name);
            fileLinks.push(name)
                var data = {
                Bucket: BucketName,
                Key: `${req.user.estateName.replace(/ /g,'')}/Polls/${name}`,
                Body: info,
                ContentType: 'application/pdf',
                ContentDisposition: 'inline',
                ACL: "public-read"
            }; // req.user.estateName
            bucket.putObject(data, function (err, data) {
                if (err) {
                    console.log('Error uploading data: ', err);
                } else {
                    console.log('succesfully uploaded the pdf!');
                    updatePolls(req, res, fileLinks)
                      /*bucket.deleteObject({
                      Bucket: BucketName,
                      Key: req.body.fileLinks[0].url
                    }, function(err, filed){
                        console.log(filed)
                    })*/
                }
            });
        }
    }
    else{
      updatePolls(req, res, fileLinks)
    }
    function updatePolls(req, res, fileLinks){
      console.log("hh")
      const poll = JSON.parse(req.body.polls)
   promiseArr.push(new Promise(function(resolve, reject){
  _.forEach(poll, function(item) {
    var options = item.options 
    var  max = -Infinity
    var key 
     options.forEach(function (v, k) { 
     if (max < +v.percentage) { 
        max = +v.percentage; 
        key = k; 
      }
      });
      var finalResult = options[key].choice
      Poll.findOneAndUpdate({
      _id: item.id
    }, {
        $set: {
          pollReport: fileLinks,
          results: item.options,
          finalResult: finalResult
        }
    },{ 
      new: true 
    })
      .then(function(r, err){
        console.log(r)
      })
        
      })
  }))
 }
})

router.post('/generateProxyForms', (req,res) => {




})

router.post('/votingReminder', (req,res) => {


    
})

router.post('/meetingReminder', (req,res)=> {



})

module.exports = router;
