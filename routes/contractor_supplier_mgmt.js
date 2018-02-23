/**
 * This file serves routes for contractor_supplier_mgmt
 */
const express = require('express');
const forEach = require('async-foreach').forEach;
const dateFormat = require('dateformat');
const router = express.Router();
const models = require('../models/models');
//models.user
const fs = require('fs');
const _ = require('lodash');
var moment = require("moment");


router.get('/contractorlist',(req,res)=>{


    res.render('contractor_supplier_mgmt');
})

router.post('/addContractor', (req,res)=>{




})
router.post('/addSupplier', (req,res)=>{


    
})
module.exports = router;