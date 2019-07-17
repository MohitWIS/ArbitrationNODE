var app = require('express');
var router = app.Router();
var Login = require('../schemas/login');
var Profile = require('../schemas/profile');
var Professional = require('../schemas/professional');
var Fees = require('../schemas/arbitrationfees');
var Public = require('../schemas/publicprofile');
var multer = require('multer');
var commonfn = require('../../common');
var VerifyToken = require('../../VerifyToken');
var nodemailer = require('nodemailer');
var crypto = require('crypto');

function setupload_dir(dir_path) {
    var fileStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/' + dir_path)
        },
        filename: function (req, file, cb) {
            var ext = file.mimetype.split("/");
            cb(null, commonfn.uniqueId() + '' + Date.now() + '.' + ext[1]);
        }
    });
    var upload = multer({
        storage: fileStorage
    }).any(); 
    return upload;
}
router.get("/", function (req, res, next) {
    return res.status(400).json({
        "status": "error",
        "result": "Bad request"
    });
});
router.post("/Find", function (req, res, next) {
    var body = req.body;
    //console.log(body);
    ".*test test.*"
    var filter = { $and: [{ homestt : "Active"},{ status: "Accept" },{ usertype:"arbitrator"}] };
     if (body.searchkey) {
        filter.$and.push({ "name": { "$regex": body.searchkey, $options: 'i' } });

        
     }
     if(body.location.length>0){
        filter.$and.push({ "city": { "$in": body.location } });
     }
     console.log(filter);
    Profile.find(filter).select('_id loginid name city usertype gender profileImg createDate').then(function (pdata) {
        console.log(pdata.length);
        var jobQueries = [];
        req.pdata = pdata;
        pdata.forEach(function(u){
            jobQueries.push(Professional.findOne({ loginid: u.loginid }).select('_id loginid description functional_area_arbitration total_Years_Working_Arbitration'));
        });
        Promise.all(jobQueries).then(function (professional){
            var feesarr = [];
            let  feesFilter = {};
            //////console.log(professional);
            req.pdata.forEach(function (u){
                  feesFilter =  { $and: [{ "loginid": u.loginid }] }; 
                if(body.max){
                    feesFilter.$and.push({ arbitration_fee: { $gte: parseInt(body.min), $lte: parseInt(body.max) }}); 
                }
                //console.log(feesFilter)
                feesarr.push(Fees.findOne(feesFilter).select('_id loginid arbitration_fee'));
            });
            Promise.all(feesarr).then(function(feesarr){
                
                var Publicarr = [];
                let publicFilter = {};
                req.pdata.forEach(function (u){
                    publicFilter =  { $and: [{ "loginid": u.loginid }] }; 
                    if(body.caseType){
                        publicFilter.$and.push({"add_case_type":body.caseType}); 
                    }
                    Publicarr.push(Public.findOne(publicFilter).select('_id loginid add_case_type public_profile'));
                });
                Promise.all(Publicarr).then(function(Publicarr){
                    var result = [];
                    var obj = { };
                   // console.log(feesarr);
                    for (var i = 0; i < req.pdata.length; i++){
                        if(feesarr[i]!=null && Publicarr[i] !=null){
                            result.push({
                                "_id": req.pdata[i]._id,
                                "loginid": req.pdata[i].loginid,
                                "city": req.pdata[i].city,
                                "usertype": req.pdata[i].usertype,
                                "profileImg": req.pdata[i].profileImg,
                                "createDate": req.pdata[i].createDate,
                                "name": req.pdata[i].name,
                                "experience":professional[i]!=null ? professional[i].total_Years_Working_Arbitration:null,
                                "professional_id":  professional[i]!=null ? professional[i]._id:null,
                                "fees_id": feesarr[i]!=null?feesarr[i]._id:null,
                                "functional_area_arbitration":professional[i]!=null ? professional[i].functional_area_arbitration:null,
                                "fees": feesarr[i]!=null?feesarr[i].arbitration_fee:null,
                                "public_profile" : Publicarr[i]!=null?Publicarr[i].public_profile:null,
                            });
                        }
                        
                    }
                    //console.log(result.length);
                    return res.status(200).json(result);
                }).catch(function (err) {
                   // ////console.log(err);
                    return res.status(500).json({ 'err': 'something went wrong' });
                });  
            }).catch(function (err) {
                //////console.log(err);
                return res.status(500).json({ 'err': 'something went wrong' });
            });
        }).catch(function (err) {
            //////console.log(err)
            return res.status(500).json({ 'err': 'something went wrong' });
        });
    }).catch(function (err) {
        //////console.log(err)
        return res.status(500).json({ 'err': 'something went wrong' });
    });
});
router.post("/Homesearch", function (req, res, next) {
    var body = req.body;
    var filter = { $and: [{ homestt : "Active"} ,{ "status": "Accept" },{"usertype":"arbitrator"} ] };
     
     if(body.location.length>0){
        filter.$and.push({ "city": { "$in": body.location } });
     }
     if (body.searchkey) {
        filter.$and.push( { $or :[{ "name": { $regex: body.searchkey, $options: 'i' }}]});
     }
    Profile.find(filter).select('_id loginid name city usertype gender profileImg createDate').then(function (pdata) {
        console.log(pdata.length);
        var jobQueries = [];
        req.pdata = pdata;
        pdata.forEach(function(u){
            jobQueries.push(Professional.findOne({ loginid: u.loginid }).select('_id loginid description functional_area_arbitration total_Years_Working_Arbitration'));
        });
        Promise.all(jobQueries).then(function (professional){
            var feesarr = [];
            let  feesFilter = {};
            req.pdata.forEach(function (u){
                  feesFilter =  { $and: [{ "loginid": u.loginid }] }; 
                if(body.max){
                    feesFilter.$and.push({ arbitration_fee: { $gte: body.min, $lte: body.max }}); 
                }
                feesarr.push(Fees.findOne(feesFilter).select('_id loginid arbitration_fee'));
            });
            Promise.all(feesarr).then(function(feesarr){
                var Publicarr = [];
                let publicFilter = {};
                req.pdata.forEach(function (u){
                    publicFilter =  { $or: [{ "loginid": u.loginid }] }; 
                    if(body.searchkey){
                        publicFilter.$or.push({"add_case_type":{ $regex: body.searchkey, $options: 'i' }}); 
                    }
                    Publicarr.push(Public.findOne(publicFilter).select('_id loginid add_case_type public_profile'));
                });
                Promise.all(Publicarr).then(function(Publicarr){
                    var result = [];
                    var obj = { };
                   
                    for (var i = 0; i < req.pdata.length; i++){
                        if(feesarr[i]!=null && Publicarr[i] !=null){
                            result.push({
                                "_id": req.pdata[i]._id,
                                "loginid": req.pdata[i].loginid,
                                "city": req.pdata[i].city,
                                "usertype": req.pdata[i].usertype,
                                "profileImg": req.pdata[i].profileImg,
                                "createDate": req.pdata[i].createDate,
                                "name": req.pdata[i].name,
                                "experience":professional[i]!=null ? professional[i].total_Years_Working_Arbitration:null,
                                "professional_id":  professional[i]!=null ? professional[i]._id:null,
                                "fees_id": feesarr[i]!=null?feesarr[i]._id:null,
                                "functional_area_arbitration":professional[i]!=null ? professional[i].functional_area_arbitration:null,
                                "fees": feesarr[i]!=null?feesarr[i].arbitration_fee:null,
                                "public_profile" : Publicarr[i]!=null?Publicarr[i].public_profile:null,
                            });
                        }
                        
                    }
                    return res.status(200).json(result);
                }).catch(function (err) {
                   // ////console.log(err);
                    return res.status(500).json({ 'err': 'something went wrong' });
                });  
            }).catch(function (err) {
                //////console.log(err);
                return res.status(500).json({ 'err': 'something went wrong' });
            });
        }).catch(function (err) {
            //////console.log(err)
            return res.status(500).json({ 'err': 'something went wrong' });
        });
    }).catch(function (err) {
        //////console.log(err)
        return res.status(500).json({ 'err': 'something went wrong' });
    });
});
router.get("/Findbyid", VerifyToken, function (req, res, next) {
    var filter = { $and: [{ "status": "Accept" }, { "loginid": req.login_id }] };
    Profile.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
router.put("/Update", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        name: body.name,
        city: body.city,
        address: body.address,
        updateDate: commonfn.Todaydate()
    };
    Profile.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/Upload", VerifyToken, function (req, res, next) {
    var currUpload = setupload_dir('profile');
    currUpload(req, res, function (err) {
        if (err) {
            ////console.log(err);
            return res.status(200).json({
                "status": "error",
                "result": "Please upload only jpg and png image!"
            });
        }
        var jsondata = {};
        if (req.files[0].fieldname == "profileImg") {
            jsondata.profileImg = req.files[0].filename;
        }
        Profile.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
            if (data) {
                return res.status(200).json(data);
            } else {
                return res.status(400).json(err);
            }
        });
    });
});
router.post('/resetpassword', VerifyToken, function (req, res, next) {
    var body = req.body;
    var pwd = crypto.createHash('sha256').update(body.password).digest('base64');
    var jsonData = {
        password: pwd,
        otp: null,
        logout_all: body.logout_all
    }

    var filter = { $and: [{ '_id': req.login_id }, { 'otp': body.otp }] }
    //////console.log(jsonData);
    Login.findOne(filter).exec().then(getData => {
        if (getData != null) {
            Login.findOneAndUpdate({ _id: req.login_id }, jsonData, { new: true }, function (err, data) {
                if (err) {
                    ////console.log(err)
                    return res.status(500).json({
                        "error": "Server Error"
                    });
                } else {
                    return res.status(200).json({
                        "success": "Password Changeed Successfully"
                    });
                }
            });
        } else {

            return res.status(400).json({
                "error": "Please Enter Valid OTP"
            });

        }
    }).catch(function (err) {
        return res.status(400).json({
            "error": "Please Enter Valid Username and Password"
        });
    });
});
router.post('/otpverify', VerifyToken, function (req, res, next) {
    var body = req.body ;
    var filter = { $and: [{ '_id': req.login_id }, { 'otp': body.otp?body.otp :"" }] }

    Login.findOne(filter).exec().then(getData => {
        if (getData != null) {
            return res.status(200).json({
                "success": "Otp Verified Successfully!!"
            });
        } else {
            return res.status(400).json({
                "error": "Please Enter Valid OTP!!"
            });
        }
    }).catch(function (err) {
        return res.status(400).json({
            "error": "Please Enter Valid OTP!!"
        });
    });
});
router.post('/sendotp', VerifyToken, function (req, res, next) {
    var login_id = req.login_id;
    //////console.log(login_id);
    Login.findOne({ '_id': login_id }).exec().then(getData => {
        if (getData != null) {
            var jsonData = { otp: "1234" };
            Login.findOneAndUpdate({ '_id': login_id }, jsonData, function (err) {
                if (err) {
                    return res.status(400).json({
                        "status": "error",
                        "result": "Please Enter Valid Username and Password"
                    });
                } else {
                    return res.status(200).json({
                        "status": "ok",
                        "result": ""
                    });
                }
            });
        } else {
            return res.status(400).json({
                "status": "error",
                "result": "Please Enter Valid Username and Password"
            });
        }
    }).catch(function (err) {
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    });
});
router.put('/notification', VerifyToken, function (req, res, next) {
    var body = req.body;
    var jsonData = {
        notification: body.notification,
    }
    Login.findOneAndUpdate({ _id: req.login_id }, jsonData, { new: true }, function (err, data) {
        if (err) {
            return res.status(500).json({
                "error": "Server Error"
            });
        } else {
            return res.status(200).json({
                "success": "Password Changeed Successfully"
            });
        }
    });


});
router.put('/arbitration/status', VerifyToken, function (req, res, next) {
    var body = req.body;
    var jsonData = {
        status: body.status,
    }
    Profile.findOneAndUpdate({ loginid: req.login_id }, jsonData, { new: true }, function (err, data) {
        if (err) {
            return res.status(500).json({
                "error": "Server Error"
            });
        } else {
            return res.status(200).json(data);
        }
    });
});
router.put('/admin/arbitration/status', VerifyToken, function (req, res, next) {
    let body = req.body;
    let jsonData = {
        status: body.status,
    }
    Profile.findOneAndUpdate({ loginid: body.login_id }, jsonData, { new: true }, function (err, data) {
        if (!err) {
            Login.findOneAndUpdate({ _id: body.login_id }, jsonData, { new: true }, function (err, data) {
                if (err) {
                    return res.status(500).json({
                        "error": "Server Error"
                    });
                } else {
                    return res.status(200).json(data);
                }
            });
           
        } else {
            return res.status(500).json({
                "error": "Server Error"
            });
        }
    });
});
module.exports = router;