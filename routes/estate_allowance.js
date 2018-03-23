/**
 * This file serves routes for notices
 */
const express = require('express');
const models = require('../models/models');
const Estate = models.Estate;
const Manager = models.Manager;
const Notice = models.Notice;
const Meeting = models.Meeting;
const Resident = models.Resident;
const Poll = models.Poll;
const Post = models.Post;
const Comment = models.Comment;
const PostReport = models.PostReport;
const Contractor = models.Contractor;

const CommentReport = models.CommentReport;
const forEach = require('async-foreach').forEach;
var Promise = require('bluebird');
const _ = require('lodash');
var Busboy = require('busboy');
var moment = require("moment");
const busboyBodyParser = require('busboy-body-parser');
var EmailService = require('../services/email')

const fs = require('fs');
const router = express.Router();
router.use(busboyBodyParser({multi: true}));


router.get('/accountApproval', (req,res) => {
  Manager.find({allowed: false})
  .then(function(es,err){
    if(err) res.send(err)
    if(es){
      console.log(err, es)
       Contractor.find({allowed: false},{ firstName: 1, email: 1, _id: 1})
      .then(function(c,err){
        if(err) res.send(err)
        if(c){
          console.log(err, c)
          res.render('estate_allowance', {estateData: es, contactorData: c})
        }
        else{
         res.render('estate_allowance', {estateData: es, contactorData: []})
       }
    })
    }
    else{
       Contractor.find({allowed: false}, { firstName: 1, email: 1, _id: 1})
      .then(function(c,err){
        if(err) res.send(err)
        if(c){
          console.log(err, c)
          res.render('estate_allowance', {estateData: [], contactorData: c})
        }
    })
  }
  })
    
})

router.post('/allowEstate', (req,res) => {
  var id = req.body.id
  console.log(id, "id")
  Manager.findOneAndUpdate({
     _id: id
    }, {
      $set: {
        allowed: true,
      }
    },{
      new: true
    })
  .then(function(estate, err){
    if(err) res.send(err);
    EmailService.sendConfirmationEmail(estate)
    res.redirect('/accountApproval')
  })

})

router.post('/allowContractor', (req,res) => {
  var id = req.body.id
  console.log(id, "id")
  Contractor.findOneAndUpdate({
     _id: id
    }, {
      $set: {
        allowed: true,
      }
    },{
      new: true
    }).lean()
  .then(function(contactor, err){
    if(err) res.send(err);
    contactor.username = contactor.firstName
    console.log(contactor, "contactor")
    EmailService.sendConfirmationEmail(contactor)
    res.redirect('/accountApproval')
  })

})


module.exports = router;
