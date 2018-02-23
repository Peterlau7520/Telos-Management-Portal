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
var options = { format: 'Letter' ,zoomFactor: 1, paginationOffset: 1, "height": "10.5in", "width": "8in"};
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

router.post('/appointProxy', (req,res)=>{
  const id = req.body.meetingYoutube2
  Meeting.findOneAndUpdate({
      _id: id
    }, {
      $set: {
        proxyFullName: req.body.proxyFullName,
      }
    },{
      new: true
    })
.then(function(meeting, err){
  res.redirect('/meetingManagement')
  if(err) res.send(err);
})
})

router.post('/updatePolls', (req,res)=>{
  const promiseArr = []
  const fileLinks=[]

  if(req.files && req.files.file) {
        var files = req.files.file
        for (var i = 0; i < files.length; i++) {
            var info = files[i].data;
            var name = files[i].name.replace(/ /g,'');
            //meeting.fileLinks.push(name);
            fileLinks.push(name)
                var data = {
                Bucket: BucketName,
                Key: `${req.body.estateName.replace(/ /g,'')}/PollReport/${name}`,
                Body: info,
                ContentType: 'application/pdf',
                ContentDisposition: 'inline',
                ACL: "public-read"
            };
            bucket.upload(data, function (err, data) {
                if (err) {
                    console.log('Error uploading data: ', err);
                } else {
                    console.log('succesfully uploaded the pdf!', data);
                      updatePolls(req, res, data.Location)
                }
            });
        }
    }
    else{
      updatePolls(req, res, fileLinks)
    }
    function updatePolls(req, res, fileLinks){
      console.log(req.body, "poll")
     const poll = JSON.parse(req.body.polls)
            console.log(poll, "poll")
     _.forEach(poll, function(item) {
     promiseArr.push(new Promise(function(resolve, reject){
    var options = item.options
    var  max = -Infinity
    var key
     options.forEach(function (v, k) {
      console.log(v, "vvvvv")
      v.choice = v.choice.replace(/_/g," ")
     if (max < +v.percentage) {
        max = +v.percentage;
        key = k;
      }
      });
     console.log(options, "options")
      var i = 0
       console.log(options[i+1].percentage, options[i+2].percentage,  options[i].percentage, "percentage")
      if(options[i].percentage === options[i+1].percentage &&  options[i+1].percentage === options[i+2].percentage){
        var finalResult = "N/A"
      }
      else{
      var finalResult = options[key].choice
      }
      console.log("Item",item);
      console.log("finalResult",finalResult);
      Poll.findOneAndUpdate({
      _id: item.id
    }, {
        $set: {
          results: item.options,
          finalResult: finalResult
        }
    },{
      new: true
    })
      .then(function(r, err){
        //if(err) res.send(err);
       resolve(r)
      })

  }))
     Promise.all(promiseArr)
    .then(function(form, err){
      if (err) res.send(err);
      Meeting.findOneAndUpdate({
         _id: req.body.meetingName
        }, {
         $set: {
          pollReport: fileLinks
        }
        },{
        new: true
      }).then(function(data, err){
        res.redirect('/meetingManagement')
            console.log("all files done")
        })
    })
     })
 }
})

router.post('/generateProxyForms', (req,res) => {
  console.log('here', req.body)
var src = ''
var body = req.body
var promiseArr = []
  console.log(req.body.endTime  , req.body.startTime  , "hhhh")
  var monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];
var monthEnd = monthNames[new Date(req.body.endTime).getMonth()]
var monthStart = monthNames[new Date(req.body.startTime).getMonth()]
var newDate = moment(new Date()).format('Do') + ' of ' + monthNames[new Date().getMonth()] + ',' + new Date().getFullYear()
var endDate = new Date(req.body.endTime).getDate()
var endMonth = monthNames[new Date(req.body.endTime).getMonth()]
var startDate = moment(new Date(req.body.startTime)).format('Do')
var startMonth = monthNames[new Date(req.body.startTime).getMonth()]
Resident.find({estateName: req.body.estate, proxyAppointed: req.body._id })
.then(function(residents, err){
  console.log(residents, "residents")
  if(residents.length == 0){
 res.redirect('/meetingManagement')  }
 else{
_.forEach(residents, function(resident) {
   promiseArr.push(new Promise(function(resolve, reject){
  console.log(resident)
  var proxyName = ''
  var alternativeproxyName = ''
  if(body.proxyFullName == ''){
    proxyName = "Ma Song Sing"
    alternativeproxyName = "Ho Yu Tin"
  }
  else{
    var arr = body.proxyFullName.split(',')
    //body.proxyFullName.split()
    proxyName = arr[0]
    alternativeproxyName = arr[1]
  }
var html = '<!DOCTYPE html>'+
'<html>'+
'<head>'+
' <title>form</title>'+
' <link rel="stylesheet" href="style.css">'+
'</head>'+
'<body>'+
'  <style>'+
'body{'+
    'font-family: arial;'+
    'font-size: 10px;'+
 ' }'+
'  .form-width{'+
   'padding: 25px;'+
'  max-width: 745px;'+
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
'  margin: 31px 0 20px 0;'+
'    font-weight: 100;'+
'}'+
'.form-contain{'+
'  max-width: 650px;'+
'  margin: 0 auto;'+
'}'+
'.form-contain p{'+
'  font-size: 10px;'+
'  line-height: 2;'+
'display: inline-block;'+
'}'+
'.text-color{'+
'  color: #CF5255;'+
'    border-bottom: 1px dotted #000; '  +
   ' min-width: 380px;'+
   ' display: inline-block;'+
       'text-align: center;'+
'}'+
'.space{'+
' text-indent: 50px;'+
'}'+
'.signature-text{'+
'  text-align: center;'+
'}'+
'.dated-para{'+
'  margin-left:73px;'+
'}'+
'.signature-block{'+
'    width: 100%;'+
    'text-align: right;'+
'}'+
'.signature-img img{'+
  'width:88px;'+
'}'+
'@media screen and (max-width: 1280px){'+
  '.text-color{'+
    'min-width: 110px;'+
 ' }'+
'}' +
'</style>'+
'  <div class="form-width">'+
'     <div class="form-heading">'+
'       '+
'     </div>'+
'       <div>'+
'       <h3 class="text-center" style=" text-align: center;padding-top: 32px;">FORM 2</h3>'+
'          <h3 class="heading-instrument">INSTRUMENT OF PROXY FOR MEETINGS OF CORPORATIONS</h3>'+
'      </div>'+
'     <div class="form-contain">'+
'       <p>The Incorporated Owners of <span class="text-color">'+resident.estateName+'</span>(description of building)</p>'+
'       <p class="space">I/We,<span class="text-color">'  +resident.name+'</span>(name(s) of owner(s)), being the owner(s) of <span class="text-color"> '+resident.unit+'</span>(unit and address of building), hereby appoint <span class="text-color">'+proxyName+'</span> (name of proxy) *[or failing him <span  class="text-color">'+alternativeproxyName+'</span> (name of alternative proxy)], as my/our proxy to attend and vote on my/our behalf at the *[general meeting/annual general meeting] of The Incorporated Owners of<span>  '+resident.estateName+'</span>(description of building), to be held on the<span class="text-color"> ' +startDate+'</span> day of <span class="text-color">'  +startMonth+'</span>*[and at any adjournment therof]</p>'+
''+
''+
'       <p class="dated-para">Dated this day of <span class="">'+ newDate +'</span> .</p><br/>'+
        '<div class="signature-block">'+
            '<div class="signature-img">'
        console.log(resident.signature, "ffffff")
        _.forEach(resident.signature, function(sign) {
          console.log(sign , "hhhhh")
          html+= '<img src="'+sign+'" alt="one" class="signatures" >'
          })
        if(resident.chopImage){
          html+= '<img src="'+resident.chopImage+'" alt="one" class="signatures" >'
        }
         html+=
         '</div>' +
'       <p class="signature-text" >Signatures</p></div>'+
'    '+
'       <span>*Delete where inapplicable.</span>'+
''+
'<hr>'+
    ' <span>The format as shown in this instrument is the statutory one which is set out in the Building Management Ordinance (Form 2 in Schedule 1A). No alteration of the format is permitted. </span>'+
'  </div>'+
'     </div>'+ '<br/>' +'<br/>' +
'<div style="margin-left: 10%;margin-bottom: 1%;margin-top: 10%;page-break-before: always; padding-top: 10% ;font-weight:500;" > Account Name: '+resident.account+ '<br/>'+
'<div style="font-weight:500">Owners Name:  ' +resident.name+'</div>'+
'<div style="margin-left: 0%;margin-bottom: 1%;" > Meeting Title English and Chinese : '+body.title+' |' +body.titleChn+ '<br/>'+
'<span> Venue : '+body.venue+'</span><br/>'+
'<span> Time: '+body.startTime+'</span>'+
'</div>'
 _.forEach(body.polls, function(poll, index) {
  console.log(poll, "poll")
  index++ ;
html+= '<div style="margin-left: 0%;'+
'    margin-bottom: 1%;">Item '+index+' : '+poll.pollName+ '|' +poll.pollNameChn + '<br/>' +'<div> Options:' +'<br/>'
_.forEach(poll.options, function(option, index1) {
  index1++;
html+= '<span style="margin-left: 0%;">' +index1+') '+option+'</span><br/>'
})
var result = ''
_.forEach(poll.votingResults, function(votes, i) {
    if(votes.resident == resident._id){
      console.log("hellooooo")
      result = votes.choice
    }
  })
html+= '<span style="">Choice: '+result+'</span>'
html+= '</div>' +'<span> Number of shares: '+resident.shares+'</span><br/>'+ '<div class="">'+ '<span style=" display:  inherit;"> Signatures:  </span>'
 _.forEach(resident.signature, function(sign) {
          console.log(sign , "hhhhh")
          html+= '<img src="'+sign+'" style="width: 8%;" alt="one" class="" >'
          })
html+= '</div>' +'</div>'
})
html+= '</body>'+
'</html>'
pdf.create(html, options).toBuffer(function(err, buffer){
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
            if (err) res.send(err)
            console.log('succesfully uploaded the pdf!' );
            resolve(data)
        })
  })
}))
})

Promise.all(promiseArr)
.then(function(form, err){
  res.redirect('/meetingManagement')
  console.log("all files done")
})
}
})
})
/*var data = convert(html, {format:'png', quality: 100, width: 1280, height: 960})
console.log(data, "")*/

router.post('/votingReminder', (req,res) => {



})

router.post('/meetingReminder', (req,res)=> {



})
router.post('/WriteExcellFile', (req, res) => {
  console.log('here')
        var JsonResultDataArray =[];
        //loop poll
        const polls = req.body.polls;
        forEach(polls, function(poll, index, arr){
          console.log('poll', poll);
          forEach(poll.votingResults, function(votingResult,index){
            const result = {
              pollName: poll.pollName,
              option: votingResult.choice,
              shares: parseFloat(votingResult.resident.shares),
              resident: votingResult.resident.name
            }
            console.log(result);
            JsonResultDataArray.push(result);
          })

        })
        console.log(JsonResultDataArray, "JsonData")
        var xls = json2xls(JsonResultDataArray);
        //console.log(xls, "xls")
        res.send({xls: xls})

})
module.exports = router;
