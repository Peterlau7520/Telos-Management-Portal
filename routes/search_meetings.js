/**
 * This file serves routes for notices
 */
const express = require('express');
const models = require('../models/models');
const Estate = models.Estate;
const Notice = models.Notice;
const Meeting = models.Meeting;
const Resident = models.Resident;
const Poll = models.Poll;
const forEach = require('async-foreach').forEach;
var Promise = require('bluebird');
const _ = require('lodash');
var Busboy = require('busboy');
var moment = require("moment");
const busboyBodyParser = require('busboy-body-parser');

const fs = require('fs');
const router = express.Router();
router.use(busboyBodyParser({multi: true}));
const dateFormat = require('dateformat');


var AWS = require('aws-sdk');
const async = require('async');
let docFileName,pathParams,dataFile;
const BucketName = 'telospdf';
AWS.config.update({
  accessKeyId: 'AKIAIMLMZLII2XCKU6UA',
  secretAccessKey: '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'
});
const bucket = new AWS.S3({params: {Bucket: BucketName}});


const appId = '72ae436c-554c-4364-bd3e-03af71505447';
const apiKey = 'YTU4NmE5OGItODM3NC00YTYwLWExNjUtMTEzOTE2YjUwOWJk';
const oneSignal = require('onesignal')(apiKey, appId, true);


let currDate = new Date();
let currentDate = currDate.getFullYear()+"-"+(currDate.getMonth()+1)+"-"+currDate.getDate()+" "+currDate.getHours()+":"+currDate.getMinutes()+":"+currDate.getSeconds();

router.get('/searchMeetings', (req,res) => {
    res.render('search_meeting')
})

router.post('/searchMeetings', (req, res) => {
  Meeting.find({estate: req.body.estateName}).populate('polls').lean().then(function(meetings, err){
      const promiseArr = []
      var currentMeetings = []
      var allMeetings = []
      var pastMeetings = []
      var pollMeeting_title = '';
      if(meetings.length > 0) {
          promiseArr.push(new Promise(function(resolve, reject){
             forEach(meetings, function(item, key, a){
               if( item.fileLinks && item.fileLinks.length > 0) {
                  let fileLinks = [];
                  var titleLink = ''
                  var fileLinksLink = ''
                  if(item.title){
                    titleLink = item.title
                    titleLink = titleLink.replace(/[^A-Z0-9]/ig, "");
                    pollMeeting_title = titleLink
                  }
                  if(item.fileLinks[0]){
                      fileLinksLink = item.fileLinks[0]
                      fileLinksLink = fileLinksLink.replace(/[^A-Z0-9]/ig, "");
                  }
                  let Key = `${item.estateName}/${item.guid}/${fileLinksLink}`;
                    fileLinks.push({
                      name: item.fileLinks[0],
                      url: "https://"+BucketName+".s3.amazonaws.com/"+Key
                    })
                  item.fileLinks = fileLinks;
              }
              if(item.polls){
                forEach(item.polls, function(poll, key, a){
                    var pollEndTime = moment(new Date(poll.endTime));
                    item.polls[key].endTime = pollEndTime.format("MM-DD-YYYY");
                    let polefileLinks = [];
                    if(poll.fileLinks){
                      forEach(poll.fileLinks, function(name, key, a){
                        let fileLinks = [];
                        var titleLink = ''
                        var fileLinksLink = ''
                        if(poll.pollName){
                          titleLink = poll.pollName
                          titleLink = titleLink.replace(/[^A-Z0-9]/ig, "");
                        }
                        if(name){
                          fileLinksLink = name
                          fileLinksLink = fileLinksLink.replace(/[^A-Z0-9]/ig, "");
                        }
                        let Key = `${item.estateName}/${item.guid}/Poll/${fileLinksLink}`;
                        polefileLinks.push({
                          name: name,
                          url: "https://"+BucketName+".s3.amazonaws.com/"+Key
                        })
                        poll.fileLinks = polefileLinks;
                      })
                   }
                })
              }
              allMeetings.push(item)
              resolve({meetingsData: allMeetings})
             })
         }))
          Promise.all(promiseArr)
          .then(function(data){
            res.json({"meetingsData": data[0].meetingsData})
         })
      }
     else{
         res.render('search_meeting')
      }
  })
})

module.exports = router;
