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


router.get('/estateManagement', (req,res) => {
    Estate.find({}, {estateName:1}, function(error, estate){
        if(estate){
            var finalArray = []
            estate.map((item) => {
              finalArray.push(item.estateName)
            })
            var promise1 = Post.find({estateName:{$in:finalArray}}).populate('comments')
            var promise2 = PostReport.find({})
            var promise3 = CommentReport.find({})
            Promise.all([promise1, promise2, promise3]).then(function(values){
              res.render('estates_management', {posts:values[0],reportedPost:values[1],reportedComment:values[2]})
            })
        }
    })
})

router.post('/reportedPosts', (req,res) => {
  PostReport.remove({"_id":{$in:req.body.reposts}}, function (error, result){
    if(!error){
      res.json({success: true, message: "Reported post deleted succesfully"})
    }
  })
})

router.post('/reportedPosts', (req,res) => {
  CommentReport.remove({"_id":{$in:req.body.recommen}}, function (error, result){
    if(!error){
      res.json({success: true, message: "Reported comment deleted succesfully"})
    }
  })
})

module.exports = router;
