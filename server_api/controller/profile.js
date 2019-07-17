var app = require('express');
var router = app.Router();
var Login = require('../schemas/login');
var Profile = require('../schemas/profile');
var Professional = require('../schemas/professional');
var Education = require('../schemas/education');
var Personal = require('../schemas/personaldetails');
var Fees = require('../schemas/arbitrationfees');
var Public = require('../schemas/publicprofile');
var Recommend = require('../schemas/recommend');
var Involve = require('../schemas/caseinvolve');
var multer = require('multer');
var commonfn = require('../../common');
var config = require('../../config');
var VerifyToken = require('../../VerifyToken');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var mongoose = require('mongoose');
var request = require('request');
var jwt = require('jsonwebtoken');
mongoose.Promise = require('bluebird');
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
router.get("/Findbyid", VerifyToken, function (req, res, next) {
    var filter = { $and: [{ "status": "Accept" }, { "loginid": req.login_id }] };
    Profile.findOne(filter, function (err, data) {
        if (!err) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ "error": "server error" });
        }
    });
});

router.get("/party/Findbyid/:loginId", VerifyToken, function (req, res, next) {
    let loginId = req.params.loginId;
    var filter = { loginid: loginId  };
    Profile.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
/*party update profile*/
router.put("/Update", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        name: body.name,
        city: body.city,
        address: body.address,
        updateDate: commonfn.Todaydate()
    };
    Profile.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
        if (!err) {
            Login.findOneAndUpdate({ _id: req.login_id }, { name: body.name }, { new: true }, function (err) {
                if (!err) {
                    return res.status(200).json(data);
                } else {
                    return res.status(400).json(err);
                }
            });
        } else {
            return res.status(400).json(err);
        }
    });
});
/*party update profile*/
router.put("/Upload", VerifyToken, function (req, res, next) {
    var currUpload = setupload_dir('profile');
    currUpload(req, res, function (err) {
        if (err) {
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
    Login.findOne(filter).exec().then(getData => {
        if (getData != null) {
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
    var body = req.body;
    var filter = { $and: [{ '_id': req.login_id }, { 'otp': body.otp ? body.otp : "" }] }
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
    Login.findOne({ '_id': login_id }).exec().then(getData => {
        if (getData != null) {
            let max = 9999;
            let min = 1000;
            let otp = Math.floor(Math.random() * (max - min + 1)) + min;
            var jsonData = { otp: otp };
            Login.findOneAndUpdate({ '_id': login_id }, jsonData, function (err) {
                if (!err) {
                    var token = jwt.sign({ login_id: login_id, email: getData.email }, config.secret, {
                        expiresIn: 3600
                    });
                    let btnurl = commonfn.baseURL2() + 'app/forgot-password-reset?' + 'token=' + token;
                    sendmail('shiv.pratap@zaptas.com', getData.name, btnurl);
                    const msg = otp + ' is your SECRET One Time Password (OTP) for Registration/ Login in edisputeresolution.com';
                    let url = 'http://sms.bulksmsserviceproviders.com/api/send_http.php?username=khushboo123&password=zapyas123&mobiles=' + getData.mobile + '&message=E-dispute OTP- ' + msg + '&sender=EDISPU&route=B'
                    request(url, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            return res.status(200).json({
                                "status": "ok",
                                "result": "sent otp"
                            });
                        } else {
                            return res.status(200).json({
                                "status": "ok",
                                "result": "sent otp"
                            });
                        }
                    })
                } else {
                    return res.status(400).json({
                        "status": "error",
                        "result": "Please Enter Valid Username and Password"
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
        homestt: body.status,
    }
    Profile.findOneAndUpdate({ loginid: req.login_id }, jsonData, { new: true }, function (err, data) {
        if (!err) {
            Login.findOneAndUpdate({ _id: req.login_id }, jsonData, { new: true }, function (err, ldata) {
                if (!err) {
                    return res.status(200).json(data);
                } else {

                    return res.status(500).json({
                        "error": "Server Error"
                    });
                }
            });
        } else {
            return res.status(500).json({
                "error": "Server Error"
            });
        }
    });
});
router.put('/party/status', VerifyToken, function (req, res, next) {
    var body = req.body;
    var jsonData = {
        status: body.status,
    }
    Profile.findOneAndUpdate({ loginid: body.login_id }, jsonData, { new: true }, function (err, data) {
        if (!err) {
            Login.findOneAndUpdate({ _id: body.login_id }, jsonData, { new: true }, function (err, ldata) {
                if (!err) {
                    return res.status(200).json(data);
                } else {

                    return res.status(500).json({
                        "error": "Server Error"
                    });
                }
            });
        } else {
            return res.status(500).json({
                "error": "Server Error"
            });
        }
    });
});
router.post("/arbitrator", VerifyToken, function (req, res, next) {
    let body = req.body;
    let case_id = body.case_id;
    if (body.Scenario == 'Scenario2') {
        let filterr = { $and: [{ "case_id": case_id }] };
        Involve.findOne(filterr).select('scenario3b _id').then(function (cdata) {
            console.log(cdata);
            let arr = [];
            var filter = { $and: [{ "status": "Accept" }, { "usertype": "arbitrator" }] };
            if (body.searchkey) {
                filter.$and.push({ "name": { $regex: body.searchkey, $options: 'i' } });
            }
            if (body.location.length > 0) {
                filter.$and.push({ "city": { "$in": body.location } });
            }

            if (cdata.scenario3b.p1arbitrator != null) {
                arr.push(cdata.scenario3b.p1arbitrator)
            }
            if (cdata.scenario3b.p2arbitrator != null) {
                arr.push(cdata.scenario3b.p2arbitrator)
            }
            if (arr.length > 0) {
                filter.$and.push({ _id: { $nin: arr } });
            }
            Profile.find(filter).select('_id loginid name city usertype gender profileImg createDate').then(function (pdata) {
                var jobQueries = [];
                req.pdata = pdata;
                pdata.forEach(function (u) {
                    jobQueries.push(Professional.findOne({ loginid: u.loginid }).select('_id loginid description functional_area_arbitration total_Years_Working_Arbitration'));
                });
                Promise.all(jobQueries).then(function (professional) {
                    let feesarr = [];
                    let feesFilter = {};
                    req.pdata.forEach(function (u) {
                        feesFilter = { $and: [{ "loginid": u.loginid }] };
                        if (body.min && body.max) {
                            feesFilter.$and.push({ arbitration_fee: { $gte: body.min, $lte: body.max } });
                        }
                        feesarr.push(Fees.findOne(feesFilter).select('_id loginid arbitration_fee'));
                    });
                    Promise.all(feesarr).then(function (feesarr) {
                        var Publicarr = [];
                        let publicFilter = {};
                        req.pdata.forEach(function (u) {
                            publicFilter = { $and: [{ "loginid": u.loginid }] };
                            if (body.caseType) {
                                publicFilter.$and.push({ "add_case_type": body.caseType });
                            }
                            Publicarr.push(Public.findOne(publicFilter).select('_id loginid add_case_type public_profile'));
                        });
                        Promise.all(Publicarr).then(function (Publicarr) {
                            var result = [];
                            for (var i = 0; i < req.pdata.length; i++) {
                                if (feesarr[i] != null && Publicarr[i] != null) {
                                    result.push({
                                        "_id": req.pdata[i]._id,
                                        "loginid": req.pdata[i].loginid,
                                        "city": req.pdata[i].city,
                                        "usertype": req.pdata[i].usertype,
                                        "profileImg": req.pdata[i].profileImg,
                                        "createDate": req.pdata[i].createDate,
                                        "name": req.pdata[i].name,
                                        "experience": professional[i] != null ? professional[i].total_Years_Working_Arbitration : null,
                                        "professional_id": professional[i] != null ? professional[i]._id : null,
                                        "fees_id": feesarr[i] != null ? feesarr[i]._id : null,
                                        "functional_area_arbitration": professional[i] != null ? professional[i].functional_area_arbitration : null,
                                        "fees": feesarr[i] != null ? feesarr[i].arbitration_fee : null,
                                        "public_profile": Publicarr[i] != null ? Publicarr[i].public_profile : null,
                                    });
                                }
                                                 }
                            return res.status(200).json(result);
                        }).catch(function (err) {
                            return res.status(500).json({ 'err': 'something went wrong' });
                        });
                    }).catch(function (err) {
                        return res.status(500).json({ 'err': 'something went wrong' });
                    });
                }).catch(function (err) {
                    return res.status(500).json({ 'err': 'something went wrong' });
                });
            }).catch(function (err) {
                return res.status(500).json({ 'err': 'something went wrong' });
            });
        }).catch(function (err) {
            return res.status(500).json({ 'err': 'something went wrong' });
        });
    } else {
        let filterr = { $and: [{ "case_id": case_id }, { ploginid: req.login_id }] };
        Recommend.find(filterr).select('arbitrator_loginid').then(function (adata) {
            let arr = [];
            for (let i = 0; i < adata.length; i++) {
                arr.push(adata[i].arbitrator_loginid)
            }
            var filter = { $and: [ { homestt : "Active"} , { "status": "Accept" }, { "usertype": "arbitrator" }] };
            if (body.searchkey) {
                filter.$and.push({ "name": { $regex: body.searchkey, $options: 'i' } });
            }
            if (body.location.length > 0) {
                filter.$and.push({ "city": { "$in": body.location } });
            }
            if (arr.length > 0) {
                filter.$and.push({ loginid: { $nin: arr } });
            }
            Profile.find(filter).select('_id loginid name city usertype gender profileImg createDate').then(function (pdata) {
                console.log(pdata.length);
                var jobQueries = [];
                req.pdata = pdata;
                pdata.forEach(function (u) {
                    jobQueries.push(Professional.findOne({ loginid: u.loginid }).select('_id loginid description functional_area_arbitration total_Years_Working_Arbitration'));
                });
                Promise.all(jobQueries).then(function (professional) {
                    let feesarr = [];
                    let feesFilter = {};
                    req.pdata.forEach(function (u) {
                        feesFilter = { $and: [{ "loginid": u.loginid }] };
                        if (body.min && body.max) {
                            feesFilter.$and.push({ arbitration_fee: { $gte: body.min, $lte: body.max } });
                        }
                        feesarr.push(Fees.findOne(feesFilter).select('_id loginid arbitration_fee'));
                    });
                    Promise.all(feesarr).then(function (feesarr) {
                        var Publicarr = [];
                        let publicFilter = {};
                        req.pdata.forEach(function (u) {
                            publicFilter = { $and: [{ "loginid": u.loginid }] };
                            if (body.caseType) {
                                publicFilter.$and.push({ "add_case_type": body.caseType });
                            }
                            Publicarr.push(Public.findOne(publicFilter).select('_id loginid add_case_type public_profile'));
                        });
                        Promise.all(Publicarr).then(function (Publicarr) {
                            var result = [];
                            for (var i = 0; i < req.pdata.length; i++) {
                                if (feesarr[i] != null && Publicarr[i] != null) {
                                    result.push({
                                        "_id": req.pdata[i]._id,
                                        "loginid": req.pdata[i].loginid,
                                        "city": req.pdata[i].city,
                                        "usertype": req.pdata[i].usertype,
                                        "profileImg": req.pdata[i].profileImg,
                                        "createDate": req.pdata[i].createDate,
                                        "name": req.pdata[i].name,
                                        "experience": professional[i] != null ? professional[i].total_Years_Working_Arbitration : null,
                                        "professional_id": professional[i] != null ? professional[i]._id : null,
                                        "fees_id": feesarr[i] != null ? feesarr[i]._id : null,
                                        "functional_area_arbitration": professional[i] != null ? professional[i].functional_area_arbitration : null,
                                        "fees": feesarr[i] != null ? feesarr[i].arbitration_fee : null,
                                        "public_profile": Publicarr[i] != null ? Publicarr[i].public_profile : null,
                                    });
                                }
                            }
                            return res.status(200).json(result);
                        }).catch(function (err) {
                            return res.status(500).json({ 'err': 'something went wrong' });
                        });
                    }).catch(function (err) {
                        return res.status(500).json({ 'err': 'something went wrong' });
                    });
                }).catch(function (err) {
                    return res.status(500).json({ 'err': 'something went wrong' });
                });
            }).catch(function (err) {
                return res.status(500).json({ 'err': 'something went wrong' });
            });
        }).catch(function (err) {
            return res.status(500).json({ 'err': 'something went wrong' });
        });
    }
});
router.get("/Find/arbitrator/:status", function (req, res) {

    let filter = {};
    if (req.params.status == 'all') {
        filter = {  $and : [ {"usertype": "arbitrator" } , { status: 'Accept' }]};
    } else if (req.params.status == 'Accept') {
        filter = { $and: [{ "usertype": "arbitrator" }, { status: 'Accept' }] };
    } else if (req.params.status == 'Reject') {
        filter = { $and: [{ "usertype": "arbitrator" }, { status: 'Reject' }] };
    } else if (req.params.status == 'Pending') {
        filter = { $and: [{ "usertype": "arbitrator" }, { status: 'Pending' }] };
    } else if (req.params.status == 'Block') {
        filter = { $and: [{ "usertype": "arbitrator" }, { status: 'Block' }] };
    }

    Profile.find(filter).populate('loginid').sort({ createDate: -1 }).exec().then(getData => {
        //console.log(getData);
        var jobQueries = [];
        getData.forEach(function (u) {
            let filter = {
                $or: [{ 'arbitrator1b2b.arbitrator': u._id },
                { 'scenario3b.p1arbitrator': u._id }, { 'scenario3b.p2arbitrator': u._id }
                    , { 'scenario3b.commonarbitrator': u._id }]
            }
            //  jobQueries.push(Involve.countDocuments(filter).select('_id'));
            //console.log( JSON.stringify(filter));
            jobQueries.push(Involve.aggregate([
                { $match: filter },
                { $group: { _id: "$casestt", count: { $sum: 1 } } },

            ]));
        });
        Promise.all(jobQueries).then(function (cdata) {
            //console.log(cdata[7]);
            let arr = [];
            let i = 0;
            let obj = { Under: 0, Ongoing: 0, Completed: 0 };
            let innersrr = [];
            getData.forEach(val => {
                innersrr = [];
                obj = { Under: 0, Ongoing: 0, Completed: 0 };
                innersrr = cdata[i];
                for (let j = 0; j < innersrr.length; j++) {
                    if (innersrr[j]._id == 'ONGOING') {
                        obj.Ongoing = innersrr[j].count
                    } else if (innersrr[j]._id == 'UNDERDISCUSSION') {
                        obj.Under = innersrr[j].count
                    } else {
                        obj.Completed = innersrr[j].count
                    }

                }
                //console.log(obj);
                arr.push({
                    _id: val._id,
                    name: val.name,
                    email: val.email,
                    mobile: val.mobile,
                    loginid: val.loginid,
                    city: val.city,
                    status: val.status,
                    createDate: val.createDate,
                    Under: obj.Under ? obj.Under : 0,
                    Ongoing: obj.Ongoing ? obj.Ongoing : 0,
                    Completed: obj.Completed ? obj.Completed : 0
                });

                i++;
            });
            return res.status(200).json(arr);

        }).catch(function (err) {
            //console.log(err);
            return res.status(400).json(err);
        });
    }).catch(function (err) {
        //console.log(err);
        return res.status(400).json({ 'err': 'something went wrong' });
    });

});
router.get("/Find/party", function (req, res) {
    var filter = { "usertype": "party" };
    Profile.find(filter).populate('loginid').exec().then(getData => {

        var jobQueries = [];
        getData.forEach(function (u) {
            let filter = { $or: [{ 'party1.p1_loginid': u._id }, { 'party2.p2_loginid': u._id }] }
            jobQueries.push(Involve.countDocuments(filter).select('_id'));
        });
        Promise.all(jobQueries).then(function (cdata) {

            let arr = [];
            let i = 0;
            getData.forEach(val => {

                arr.push({
                    id: val._id,
                    name: val.name,
                    email: val.email,
                    mobile: val.mobile,
                    loginid: val.loginid,
                    city: val.city,
                    status: val.status,
                    totalAmount: val.totalAmount,
                    caseCount: cdata[i],
                    createDate: val.createDate
                });
                i++;
            });
            //console.log(arr);
            return res.status(200).json(arr);

        }).catch(function (err) {
            return res.status(400).json(err);
        });

    }).catch(function (err) {
        return res.status(400).json(err);
    });

});
function sendmail(toemail, name, btnurl) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'edisputecontact@gmail.com',
            pass: 'edispute123'

        }
    });
    var temp = commonfn.forgotpwdtemp();
    var mapObj = {
        '{name}': name,
        '{reset_url}': btnurl,
        '{action_url}': commonfn.baseURL2() + 'home'
    };
    temp = temp.replace(/{name}|{reset_url}|{action_url}/gi, function (matched) {
        return mapObj[matched];
    });
    var mailOptions = {
        from: 'shiv.pratap@zaptas.com',
        to: toemail,
        subject: 'Reset Password',
        html: temp
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {

        } else {
            return true;
        }
    });
}
router.get("/home/arbitrator/:loginId", function (req, res, next) {
    let loginid = req.params.loginId;
    var filter = { "loginid": loginid };
    Profile.findOne(filter).exec().then(pData => {
        Public.findOne(filter).exec().then(pubData => {
            Professional.findOne(filter).exec().then(fData => {
                return res.status(200).json({
                    profile: pData,
                    Public: pubData,
                    Professional: fData
                });

            }).catch(function (err) {
                return res.status(400).json(err);
            });
        }).catch(function (err) {
            return res.status(400).json(err);
        });
    }).catch(function (err) {
        return res.status(400).json(err);
    });


});
router.get("/viewbyId/arbitrator/:id", function (req, res) {
    //console.log(req.params.id);
    filter = { $and: [{ _id: req.params.id }] };
    Profile.findOne(filter).populate('loginid').sort({ createDate: -1 }).exec().then(getData => {

        Fees.findOne({ loginid : getData.loginid}).exec().then(FeesData => {
        let filter2 = {
            $or: [{ 'arbitrator1b2b.arbitrator': getData._id },
            { 'scenario3b.p1arbitrator': getData._id }, { 'scenario3b.p2arbitrator': getData._id }
                , { 'scenario3b.commonarbitrator': getData._id }]
        }
        Involve.find(filter2).populate('case_id').sort({ createDate: -1 }).exec().then(cData => {

            let jsonf = { $or: [{ 'arbitrator1b2b.arbitrator': req.params.id }, { 'scenario3b.p1arbitrator': req.params.id }, { 'scenario3b.p2arbitrator': req.params.id }, { 'scenario3b.commonarbitrator': req.params.id }] };
            //  jobQueries.push(Involve.countDocuments(filter).select('_id'));
            // console.log( JSON.stringify(filter3));
            Involve.aggregate([
                { $match: filter2 },
                { $group: { _id: "$casestt", count: { $sum: 1 } } },

            ]).exec().then(countData => {
                let obj = { Under: 0, Ongoing: 0, Completed: 0 };
                for (let j = 0; j < countData.length; j++) {
                    if (countData[j]._id == 'ONGOING') {
                        obj.Ongoing = countData[j].count
                    } else if (countData[j]._id == 'UNDERDISCUSSION') {
                        obj.Under = countData[j].count
                    } else {
                        obj.Completed = countData[j].count
                    }

                }
                console.log(countData);
                return res.status(200).json({
                    info: getData,
                    caseInfo: cData,
                    countinfo: obj,
                    fees : FeesData!= null ? FeesData.arbitration_fee : 0
                });
            }).catch(function (err) {
                console.log(err);
                return res.status(400).json(err);
            });

        }).catch(function (err) {
            console.log(err);
            return res.status(400).json(err);
        });
    }).catch(function (err) {
        console.log(err);
        return res.status(400).json(err);
    });

    }).catch(function (err) {
        console.log(err);
        return res.status(400).json(err);
    });
});
router.get("/viewbyId/party/:id", function (req, res) {
    filter = { $and: [{ _id: req.params.id }] };
    Profile.findOne(filter).populate('loginid').sort({ createDate: -1 }).exec().then(getData => {
        let filter2 = {
            $or: [{ 'party1.p1_loginid': getData._id },
            { 'party2.p2_loginid': getData._id }]
        }
        Involve.find(filter2).populate('case_id').sort({ createDate: -1 }).exec().then(cData => {

              Involve.aggregate([
                { $match: filter2 },
                { $group: { _id: "$casestt", count: { $sum: 1 } } },

            ]).exec().then(countData => {
                let obj = { Under: 0, Ongoing: 0, Completed: 0 };
                for (let j = 0; j < countData.length; j++) {
                    if (countData[j]._id == 'ONGOING') {
                        obj.Ongoing = countData[j].count
                    } else if (countData[j]._id == 'UNDERDISCUSSION') {
                        obj.Under = countData[j].count
                    } else {
                        obj.Completed = countData[j].count
                    }

                }
                console.log(getData);
                return res.status(200).json({
                    info: getData,
                    caseInfo: cData,
                    countinfo: obj
                });
            }).catch(function (err) {
                console.log(err);
                return res.status(400).json(err);
            });

        }).catch(function (err) {
            console.log(err);
            return res.status(400).json(err);
        });
    }).catch(function (err) {
        console.log(err);
        return res.status(400).json(err);
    });
});
router.get("/dashboard", function (req, res, next) {
    let loginid = req.params.loginId;
    var filter1 = { "usertype": 'party' };
    var filter2 = { "usertype": 'arbitrator' };
    var filter3 = { "casestt": 'COMPLETED' };
    var filter4 = { "casestt": 'ONGOING' };
    Profile.countDocuments(filter1).exec().then(party => {
        Profile.countDocuments(filter2).exec().then(arbitrator => {
            Involve.countDocuments(filter3).exec().then(completed => {
                Involve.countDocuments(filter4).exec().then(ongoing => {
                    return res.status(200).json({
                        party: party,
                        arbitrator: arbitrator,
                        completed: completed ,
                        ongoing: ongoing
                    });
                }).catch(function (err) {
                    return res.status(400).json(err);
                });
            }).catch(function (err) {
                return res.status(400).json(err);
            });
        }).catch(function (err) {
            return res.status(400).json(err);
        });
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});

router.get("/ProfileInfo/arbitrator/:loginId", function (req, res, next) {
    let loginid = req.params.loginId;
    var filter = { _id: loginid };
    Profile.findOne(filter).exec().then(pData => {
        Public.findOne({loginid : pData.loginid}).exec().then(pubData => {
            Professional.findOne({loginid : pData.loginid}).exec().then(fData => {
                Education.findOne({loginid : pData.loginid}).exec().then(eData => {
                    Fees.findOne({loginid : pData.loginid}).exec().then(FeesData => {
                        Personal.findOne({loginid : pData.loginid}).exec().then(PersonalData => {

                        
                        return res.status(200).json({
                            profile: pData,
                            Public: pubData,
                            Professional: fData,
                            Education : eData,
                            Fees : FeesData,
                            Personal : PersonalData
                        });
                    }).catch(function (err) {
                        return res.status(400).json(err);
                    });
                }).catch(function (err) {
                    return res.status(400).json(err);
                });

            }).catch(function (err) {
                return res.status(400).json(err);
            });
        }).catch(function (err) {
            return res.status(400).json(err);
        });
    }).catch(function (err) {
        return res.status(400).json(err);
    });
 });
});

module.exports = router;