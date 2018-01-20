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
      console.log(estate, "estateestate")
        if(estate){
            var finalArray = []
            var i = -1
            var next =  function(){
              i++;
              if(i < estate.length){
                var estateObj = {}
                estateObj.estateName = estate[i].estateName
                Post.find({estateName:estate[i].estateName}, function(err, post){
                  if(post){
                    estateObj.posts = post
                    Comment.find({estateName:estate[i].estateName}, function(error, comment){
                      if(comment){
                        estateObj.comments = comment
                        finalArray.push(estateObj)
                        next();
                      }
                    })
                  }
                })
              } else {
                 console.log(finalArray, "finalArrayfinalArray")
                 res.render('estates_management')
              }
            }
            next();
        }
    })
})

module.exports = router;
