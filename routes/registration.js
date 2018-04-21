const models = require('../models/models')
const Resident = models.Resident
const Estate = models.Estate
//Async forEach
var forEach = require('async-foreach').forEach;
//Password Generator
var generator = require('generate-password');
function registration(data){
    console.log(data, "data")
    const excelFile =  data;
    var blockArray = {'Blocks': {}}
    var EstateName = ''
    const passwords = generator.generateMultiple(data.length, {
        length: 7,
        numbers: true,
        uppercase: false
     });
    forEach(data, function(item, index) {
        console.log(item, "item")
        EstateName = item.estateName.split(" ").join("");;
        var accoutName = "";
        if(item.name === "admin"){
            accoutName = "admin";
        }else{
            accoutName = item.estateName + index;
        }
        const resident = new Resident({
            estateName: EstateName,
            name: item.name,
            nature: item.nature,
            shares: item.shares,
            block: item.block,
            floor: item.floor,
            password: passwords[index],
            unit: item.unit,
            account: accoutName.toLowerCase(),
            numberOfOwners: item.name.split(',').length,
            registered: false
        })
        item["account"] = accoutName.toLowerCase();
        item["password"] = passwords[index];
        var y = blockArray.Blocks.hasOwnProperty(item.block);
        if(y === true){
            blockArray.Blocks[item.block].push(item.floor)
        }
        else{
            blockArray.Blocks[item.block] = [item.floor]
        }
        Resident.findOne({
            account: item["account"],
            estateName: EstateName
        })
        .then(function(savedResident,err){
            console.log('saved', savedResident)
            if(!savedResident){
                resident.save(function(errors, resident){
                    if(err){
                        console.log(err)
                    }
                    console.log(resident)
                });
            }
        })
      })
    console.log(blockArray, "blockArray")

     Estate.findOneAndUpdate({
      estateName: EstateName
    }, {
      $set: {
        blockArray: blockArray
      }
    },{
      new: true
    })
     .then(function(data, err){
        if(err){
                console.log(err)
            }
     })
     return excelFile;


}


module.exports = {
    registration
  }
