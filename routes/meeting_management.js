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
var htmlConvert = require('html-convert');
var convert = htmlConvert();
var pdf = require('html-pdf');
var json2xls = require('json2xls');
const download = require('download');
var http = require('http');
//AWS
const BucketName = 'telospdf';
AWS.config.update({
  accessKeyId: /*process.env.S3_KEY |*/ "AKIAIMLMZLII2XCKU6UA",
  secretAccessKey: /*process.env.secretAccessKey |*/ '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'
});

const bucket = new AWS.S3({params: {Bucket: BucketName}});


//Data models
const Estate = models.Estate;
const Resident = models.Resident;
const Meeting = models.Meeting;
const Poll = models.Poll
router.use(busboyBodyParser({multi: true}));
let currentDate = moment.utc(new Date()); 
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
      path: 'voted',
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
    Meeting.find().populate('polls').lean().sort({startTime: -1})
    .then(function(meeting, err){
      _.forEach(meeting, function(item){
        var pollEndTime = moment.utc(new Date(item.pollEndTime));
        if(pollEndTime > currentDate || pollEndTime == currentDate){
          item.pollTime = "Remind"
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
      const poll = JSON.parse(req.body.polls)
      console.log("hh", poll)
  _.forEach(poll, function(item) {
    console.log(item, "item")
     promiseArr.push(new Promise(function(resolve, reject){
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
      console.log("Item",item);
      console.log("finalResult",finalResult); 
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
        if(err) res.send(err);
       res.redirect('/meetingManagement')
      })
        
  }))
     })
 }
})

router.post('/generateProxyForms', (req,res) => {
var src = ''
var promiseArr = []
  console.log(req.body._id, "hhhh", req.user.estateName)
Resident.find({estateName: req.user.estateName, proxyAppointed: req.body._id })
.then(function(residents, err){
  console.log(residents, "resident")
_.forEach(residents, function(resident) {
promiseArr.push(new Promise(function(resolve, reject){
var html = '<!DOCTYPE html>'+
'<html>'+
'<head>'+
' <title>form</title>'+
' <link rel="stylesheet" href="style.css">'+
'</head>'+
'<body>'+
'  <style>'+
'  .form-width{'+
'  width: 745px;'+
'    margin: 0 auto;'+
'}'+
'.heading-left{'+
'    font-size: 20px;'+
'    font-weight: 600;'+
'    width: 70%;'+
'    display: inline-block;'+
'}'+
'.heading-right{'+
'  float: right;'+
'    font-size: 20px;'+
'    font-weight: 600;'+
'    width: 15%;'+
'}'+
'.heading-instrument{'+
'  text-align: center;'+
'  margin: 31px 0 63px 0;'+
'    font-weight: 100;'+
'}'+
'.form-contain{'+
'  max-width: 650px;'+
'  margin: 0 auto;'+
'}'+
'.form-contain p{'+
'  font-size: 17px;'+
'  line-height: 2;'+
'}'+
'.text-color{'+
'  color: #CF5255;'+
'}'+
'.space{'+
' text-indent: 50px;'+
'}'+
'.signature-text{'+
'  text-align: center;'+
'}'+
'.dated-para{'+
'  margin: 35px 0 56px 0;'+
'  text-align: center;'+
'}'+
'</style>'+
'  <div class="form-width">'+
'     <div class="form-heading">'+
'       <span class="heading-left">Statutory Format of the Instrument of Proxy<br> for Meetings of Corporation</span>'+
'       <span class="heading-right">Appendix 6</span>'+
'       '+
'     </div>'+
'       <div>'+
'          <h3 class="heading-instrument">INSTRUMENT OF PROXY FOR MEETINGS OF CORPORATIONS</h3>'+
'      </div>'+
'     <div class="form-contain">'+
'       <p>The Incorporated Owners of <span class="text-color">'+resident.estateName+'</span>(description of building)</p>'+
'       <p class="space">I/We,<span class="text-color">'  +resident.name+'</span>(name(s) of owner(s)), being the owner(s) of <span class="text-color"> '+resident.unit+'</span>(unit and address of building), hereby appoint <span class="text-color">Telos</span> (name of proxy) *[or failing him <span  class="text-color"></span> (name of alternative proxy)], as my/our proxy to attend and vote on my/our behalf at the *[general meeting/annual general meeting] of The Incorporated Owners of<span>  '+resident.estateName+'</span>(description of building), to be held on the<span class="text-color"> ' +req.body.endTime+'</span> day of <span class="text-color">'  +req.body.startTime+'</span>*[and at any adjournment therof]</p>'+
''+
''+
'       <p class="dated-para">Dated this day of <span class="text-color">'+ new Date() +'</span> .</p>'
        console.log(resident.signature, "ffffff")
        _.forEach(resident.signature, function(sign) {
          console.log(sign , "hhhhh")
          html+= '<img src="'+sign+'" alt="one" >'
          }) 
        if(resident.chopImage){
          html+= '<img src="'+resident.chopImage+'" alt="one" >'
        }
         html+=
'        <p class="signature-text"><span class="text-color">resident.signature</span>(Signature of owner(s))</p>'+
'    '+
'       <span>*Delete where inapplicable.</span>'+
'     </div>'+
''+
'  </div>'+
'</body>'+
'</html>'
pdf.create(html).toBuffer(function(err, buffer){
  console.log('This is a buffer:', buffer, Buffer.isBuffer(buffer));
 var data = {
                Bucket: BucketName,
                Key: `${resident.estateName}/ProxyForm/${resident.name}`,
                Body: buffer,
                ContentType: 'application/pdf',
                ContentDisposition: 'inline',
                ACL: "public-read"
            }; // req.user.estateName
bucket.putObject(data, function (err, data) {
            if (err) {
                    console.log('Error uploading data: ', err);
                } else {
            console.log('succesfully uploaded the pdf!');
            resolve(data)
        }
  });
});
}))
Promise.all(promiseArr)
.then(function(form, err){
  res.redirect('/meetingManagement')
  console.log("all files done")
})
})
})
/*var data = convert(html, {format:'png', quality: 100, width: 1280, height: 960})
console.log(data, "")*/

})

router.post('/votingReminder', (req,res) => {


    
})

router.post('/meetingReminder', (req,res)=> {



})
router.post('/WriteExcellFile', (req, res) => {
  console.log(req.body,"h", req.user)
  const userId = req.user._id          //"5a447b9b1ffe2fd7868ea80c"
        var JsonResultDataArray =[];
                //var ResultData = poll[key];
                 _.forEach(req.body.polls, function(poll) {
                  console.log(poll, "poll")
                  var JsonData = {}
                   JsonData.PollName = poll.pollName
                   //var index = _.findIndex(poll.votingResults, function(o) { return o.resident == userId; });
                      if(poll.votingResults.length !=0 ) { //index > 0 || index == 0) {
                        console.log("h")
                        JsonData.option = poll.votingResults[0].choice
                      }
                      else{
                        JsonData.option = ''
                      }
                  if(poll.voted.length != 0){
                    _.forEach(poll.voted, function(vote) {
                    JsonData.votedBy = vote.name
                    JsonData.shares = vote.shares
                  })
                  }
                  else{
                    JsonData.votedBy = ''
                    JsonData.shares = ''
                  }
                    
                    JsonResultDataArray.push(JsonData)
                });
                  console.log(JsonResultDataArray, "JsonData")
                  var xls = json2xls(JsonResultDataArray);
                  //console.log(xls, "xls")
                  res.send({xls: xls})

                  /*fs.writeFileSync('data.xlsx', xls, 'binary');
                  console.log("converted")*/

                  /*app.get('/',function(req, res) {*/
                      /*res.xls('data.xlsx', JsonResultDataArray);
                       console.log("converted")*/
                  //});


       /* var xls = json2xls(JsonResultDataArray);
       fs.writeFile('./uploads/'+ req.body.title.replace(/ /g,'') +'.xls', xls, function () {
        
    res.json({fileName: './uploads/'+ req.body.title.replace(/ /g,'') +'.xls'});
});*/
});
module.exports = router;
