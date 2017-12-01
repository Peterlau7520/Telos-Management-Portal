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

//Data models
const Estate = models.Estate;
const Meeting = models.Meeting;
const Poll = models.Poll

router.get('/accountManagement', (req,res) => {
    res.render('account_management')
})

module.exports = router;
