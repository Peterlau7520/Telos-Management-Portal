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
const _ = require('lodash');
const busboyBodyParser = require('busboy-body-parser');
const fs = require('fs');
var AWS = require('aws-sdk');

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

router.get('/meetingManagement', (req,res)=> {

    res.render('meeting_management');

})

router.post('/sendYouTubeLink', (req,res)=>{



    

})

router.post('/getPolls', (req,res)=>{
    
    
    
    
})
router.post('/updatePolls', (req,res)=>{
    
    
    
        
})

router.post('/generateProxyForms', (req,res) => {




})

router.post('/votingReminder', (req,res) => {


    
})

router.post('/meetingReminder', (req,res)=> {



})
module.exports = router;
