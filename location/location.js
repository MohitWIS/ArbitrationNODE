var app = require('express');
var router = app.Router();
var country = require('./models/location');
var state = require('./models/state');
var city = require('./models/city');
var path = require('path')
var commonfn = require('../common');
var fs = require('fs');
var jsonData = require('./states.json');
router.get("/", function(req, res, next){
    return res.status(400).json({
        "status": "error",
        "result": "Bad request"
    });
});
// Add by .json by admin
router.get('/addstate',function(req,res)
{
  var todaydate = commonfn.Todaydate();
  // var createby ={  admin_id :  body.admin_id,
  //                 create_date : todaydate
  //               }
  country.find({}).sort({'_id':-1}).exec().then(data =>{
     if (data == ''){
          return res.status(400).json({
              "status": "error",
              "result": "No data found"
          });
      } else {
          var finnalarr=[]
          var statejson={}
           var stateobj;
           fs.readFile(__dirname+'/states.json', 'utf8', function (err, sdata) {
            if (err) throw err;
             stateobj = JSON.parse(sdata);
             //console.log(data);
              for (var i = 0; i < data.length; i++){
                     for (var j = 0; j < stateobj.length; j++) {
                        if (data[i].c_id == stateobj[j].country_id) {
                           statejson={}
                            statejson.country_id = data[i]._id 
                            statejson.s_id = stateobj[j].s_id
                            statejson.state_name = stateobj[j].state_name
                            //console.log(statejson)
                            finnalarr.push(statejson);
                        }
                     }  
                }
                console.log(finnalarr)
                //Table.insertMany(your_JSON_array).then(doc => { // something... })
              state.insertMany(finnalarr).then(data =>{ 
               // state.insertMany(cjson,function(err,data){
                    return res.status(200).json({
                      "status": "ok",
                      "result": "State Added Successfully"
                     });
             }).catch(function(err) {
                 console.log(err)
                return res.status(400).json({
                    "status": "error",
                    "result": "Please contact admin"
                });
            });
                // return res.status(200).json({
                //    "status": "error",
                //     "result": finnalarr
                //      });
          });
      }
  }).catch(function(err) {
      //console.log(err)
      return res.status(400).json({
          "status": "error",
          "result": "Please contact admin"
      });
  });
});
router.get('/addcity',function(req,res){
  state.find({}).sort({'_id':-1}).exec().then(data =>{
     if (data == ''){
          return res.status(400).json({
              "status": "error",
              "result": "No data found"
          });
      } else {
          var finnalarr=[];
          var cityjson={};
           var stateobj;
           fs.readFile(__dirname+'/cities.json', 'utf8', function (err, cdata) {
            if (err) throw err;
             cityobj = JSON.parse(cdata);
              // console.log(cityobj);
              for (var i = 0; i < data.length; i++){
                     for (var j = 0; j < cityobj.length; j++){
                        if(data[i].s_id == cityobj[j].s_id){
                            cityjson = {};
                            cityjson.state_id = data[i]._id; 
                            cityjson.country_id = data[i].country_id; 
                            cityjson.city_name = cityobj[j].name; 
                            finnalarr.push(cityjson);
                        }
                     } 
                    //  return res.status(200).json({
                    //     "status": "ok",
                    //     "result": finnalarr
                    //    });  
                }
                // return res.status(200).json({
                //         "status": "ok",
                //         "result": finnalarr
                //        }); 
            city.find({}).sort({'_id':-1}).exec().then(data =>{   
                if (data !=null) {
                    city.insertMany(finnalarr).then(data =>{ 
                        // state.insertMany(cjson,function(err,data){
                             return res.status(200).json({
                               "status": "ok",
                               "result": "City Added Successfully"
                              });
                             }).catch(function(err) {
                                 console.log(err)
                                return res.status(400).json({
                                    "status": "error",
                                    "result": "Please contact admin"
                                });
                            });
         
                } else{
                    return res.status(200).json({
                        "status": "error",
                        "result": "Please contact admin"
                    });
                }   
               
             }).catch(function(err) {
                 console.log(err)
                return res.status(400).json({
                    "status": "error",
                    "result": "Please contact admin"
                });
            });

          });
          
          
      }
  }).catch(function(err) {
      //console.log(err)
      return res.status(400).json({
          "status": "error",
          "result": "Please contact admin"
      });
  });
});
router.get('/count',function(req,res){
    state.find({}).sort({'_id':-1}).exec().then(data =>{
       if (data == ''){
            return res.status(400).json({
                "status": "error",
                "result": "No data found"
            });
        } else {
            var finnalarr=[];
            var cityjson={};
             var stateobj;
             fs.readFile(__dirname+'/city.json', 'utf8', function (err, cdata) {
              if (err) throw err;
                 cityobj = JSON.parse(cdata);
                 //console.log(cityobj.length);
                  return res.status(200).json({
                          "status": "ok",
                          "result": cityobj.length
                         }); 
                         
                  city.insertMany(finnalarr).then(data =>{ 
                 // state.insertMany(cjson,function(err,data){
                      return res.status(200).json({
                        "status": "ok",
                        "result": "City Added Successfully"
                       });
                    
  
               }).catch(function(err) {
                   console.log(err)
                  return res.status(400).json({
                      "status": "error",
                      "result": "Please contact admin"
                  });
              });
  
            });
            
            
        }
    }).catch(function(err) {
        //console.log(err)
        return res.status(400).json({
            "status": "error",
            "result": "Please contact admin"
        });
    });
  });
router.get('/updatemany',function(req,res){
   country.update({ },{ isdelete: 0 },{'multi':true},function(err,data){
                         if(err){
                               return res.status(500).json({
                                  "status":"error",
                                  "result":"server error"
                               });
                         }
                       return res.status(200).json({
                        "status":"ok",
                        "result":"country Deleted Successfully"
                       })
                     });
});
module.exports = router;