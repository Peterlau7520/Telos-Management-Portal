/**
 * This file serves routes for meetingManagement
 *
 */
const express = require('express');
const forEach = require('async-foreach').forEach;
const dateFormat = require('dateformat');
const router = express.Router();
const models = require('../models/models');
const convertExcel = require('excel-as-json').processFile;
const json2xls = require('json2xls');
var Busboy = require('busboy');
const _ = require('lodash');
const busboyBodyParser = require('busboy-body-parser');
const fs = require('fs');
const path = require('path');
var AWS = require('aws-sdk');

//Data models
const Estate = models.Estate;
const Resident = models.Resident;
const Meeting = models.Meeting;
const Poll = models.Poll

router.get('/accountManagement', (req,res) => {
    res.render('account_management')
})

router.post('/searchUser', (req, res) => {
  console.log(req.body, "user")
  var query = []
  query['$or']=[];
  query["$or"].push()
  Resident.find({account: req.body.estateName})
  .then(function(data){
    res.render('account_management', {searchResult: data})
    console.log(data)
  })
  //{ $regex: term, $options: 'i'}
})
router.post('/updateOwnersResults', (req,res) => {
  console.log(req.body)
Resident.findOneAndUpdate({_id: req.body.id},
 { $set: {
    name: req.body.name,
    password: req.body.password,
    shares: req.body.shares,
    HKIDUrl: req.body.hkidUrl,
    digitalSignature: req.body.digitalSignatureUrl
  }
}, {
      new: true
    })
.then(function(resident, err){
  res.render('account_management')
  console.log(resident)
  //res.json({data: resident, message: "Data Updated"})
})
})

router.post('/searchEstate', (req, res) => {
  Estate.find({estateName: req.body.esName})
  .then(function(data){
    if(data.length){
      res.json({success: true, message: "Estate Found"})
    } else {
      res.json({success: false, message: "Estate Not Found"})
    }
  })
})

router.post('/generateAccount', (req, res) => {
  var files = req.files.file;
  var info = files[0].data;
  var name = files[0].name.replace(/ /g,'');
  var fileBuffer = info;
  var fileLocation = path.join('public', 'uploads', name);
  var uploadFile = fileLocation;
  var fileurl = path.join('uploads',  name);
  fs.writeFile(uploadFile, fileBuffer,function(err) {
      if (err) {console.log(err);}
      convertExcel( fileLocation, undefined, undefined, function(err, data){
          console.log(data, "data")
          res.json({data: data})
      });
   });
})

module.exports = router;
