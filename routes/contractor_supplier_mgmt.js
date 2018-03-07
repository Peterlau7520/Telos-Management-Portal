/**
 * This file serves routes for contractor_supplier_mgmt
 */
const express = require('express');
const forEach = require('async-foreach').forEach;
const dateFormat = require('dateformat');
const router = express.Router();
const models = require('../models/models');
const Supplier = models.Supplier;
const Contractor = models.Contractor;

//models.user
const fs = require('fs');
const _ = require('lodash');
var moment = require("moment");
var AWS = require('aws-sdk');
//AWS
const BucketName = 'telospdf';
AWS.config.update({
  accessKeyId: 'AKIAIRBP4HZIW3P7C7VQ',
  secretAccessKey: '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',
  region: 'ap-southeast-1'
});
const bucket = new AWS.S3({params: {Bucket: BucketName}});

router.get('/contractorlist',(req,res)=>{


    res.render('contractor_supplier_mgmt');
})

router.post('/addSupplier', (req,res)=>{
  const data = req.body
  var category = []
   var subcategory = []
   var s = data.category;
    var match = s.split(', ')
    for (var a in match)
    {
        var variable = match[a]
        category.push(variable)
    }
    category = category.filter(Boolean)
     var sub = data.subcategory;
      var matchsub = sub.split(', ')
      for (var a in matchsub)
      {
          var variable = matchsub[a]
          subcategory.push(variable)
      }
      subcategory = subcategory.filter(Boolean)
      const body = {
        chineseName: data.chineseName,
        englishName: data.englishName,
        foundedIn: data.foundedIn,
        address: {
          english: data.companyAddressEnglish, 
          chinese:data.companyAddressChinese,
        },
        fax: data.fax,
        tel: data.tel,
        category: category,
        subcategory: subcategory,
        website: data.website,
        contactPerson: data.contactPerson,
        description: data.description
      }
       const supplier = new Supplier(body)
        supplier.save(function(err, supp){
          if(err) res.send(err);
          res.render('contractor_supplier_mgmt');
          /*res.json({message: "Supplier created succesfully"})*/
        })
  


})
router.post('/addContractor', (req,res)=>{
  const fileLinks = []
  if(req.files && req.files.businessRegistry) {
        var files = req.files.businessRegistry
        for (var i = 0; i < files.length; i++) {
            var info = files[i].data;
            var name = files[i].name.replace(/ /g,'');
            //meeting.fileLinks.push(name);
            fileLinks.push(name)
                var data = {
                Bucket: BucketName,
                Key: `contractors/${name}`,
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
                      addSupplier(req, res, data.Location)
                }
            });
        }
    }
    else{
      addSupplier(req, res, fileLinks)
    }

    function addSupplier(req,res, fileLinks){
      const data = req.body
      var category = []
      var s = data.category;
      var match = s.split(', ')
      for (var a in match)
      {
          var variable = match[a]
          category.push(variable)
      }
      category = category.filter(Boolean)
       const body = {
        chineseName: data.chineseName,
        englishName: data.englishName,
        foundedIn: data.foundedIn,
        address: {
          english: data.companyAddressEnglish, 
          chinese:data.companyAddressChinese,
        },
        category: category,
        description: data.description,
        businessRegistry: fileLinks,
      }
      const contractor = new Contractor(body)
      contractor.save(function(err, contract){
        if(err) res.send(err);
        res.render('contractor_supplier_mgmt')
      })
    }
})
module.exports = router;