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
const CommentReport = models.CommentReport;
const forEach = require('async-foreach').forEach;
var Promise = require('bluebird');
const _ = require('lodash');
var Busboy = require('busboy');
var moment = require("moment");
const busboyBodyParser = require('busboy-body-parser');

const fs = require('fs');
const router = express.Router();
router.use(busboyBodyParser({multi: true}));


router.get('/accountApproval', (req,res) => {
  Manager.find()
  .then(function(es,err){
    if(err) res.send(err)
    if(es){
      console.log(err, es)
      res.render('estate_allowance', {estateData: es})
    }
  })
    
})

router.post('/allowEstate', (req,res) => {
  var id = req.body.id
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
    res.redirect('/accountApproval')
  })

})


module.exports = router;
