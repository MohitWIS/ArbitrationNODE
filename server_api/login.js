var app = require('express');
var router = app.Router();
var ids = require('short-id');
var Login = require('./schemas/login');
var Contact = require('./schemas/contactUs');
var Profile = require('./schemas/profile');
var crypto = require('crypto');
var multer = require('multer');
var commonfn = require('../common');
var moment = require('moment-timezone');
var jwt = require('jsonwebtoken');
var config = require('../config');
var VerifyToken = require('../VerifyToken');
var PwdVerifyToken = require('../PwdVerifyToken');
var nodemailer = require('nodemailer');
var request = require('request');

ids.configure({
    length: 6,          // The length of the id strings to generate
    algorithm: 'sha1',  // The hashing algoritm to use in generating keys
    salt: Math.random   // A salt value or function
});
/* file storage path */
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
/* Login request for admin */
router.post("/login", function (req, res, next) {
    var body = req.body;
    var email = body.email;
    var password = body.password;
    var todaydate = commonfn.Todaydate();
   
    if (email == '' || !email || email == undefined) {
        commonfn.formValidate('email', res);
        return false;
    }
    if (password == '' || !password || password == undefined) {
        commonfn.formValidate('password', res);
        return false;
    }
    var hash = crypto.createHash('sha256').update(password).digest('base64');
    var deletefind = { $and: [{ "email": email }] };
    var sltp = 'city gender profileImg createDate';
    Login.findOne(deletefind).exec().then(getData => {
        //console.log(getData);
        if (getData != null) {
                if(getData.status=='Pending' && getData.usertype =='party'){
                    return res.status(200).json({
                        "status": "Pending",
                        "result": "Your Profile did not appoved, Please wait"
                    });
                }
                if(getData.status==='Reject' && getData.usertype =='party'){
                    return res.status(200).json({
                        "status": "Reject",
                        "result": "Your Profile has been rejected, So please contact E-dispute team"
                    });
                }
                if(getData.status==='Block'){
                    return res.status(200).json({
                        "status": "Reject",
                        "result": "Your profile has been blocked, So please contact E-dispute team"
                    });
                }
            var datafind = { $and: [{ "email": email }, { "password": hash }] };
            Login.findOne(datafind).exec().then(data => {
                if (data != null) {
                    var jsondata = {};
                    Profile.findOne({ loginid: data._id }).exec().then(pdata => {
                        if (data != null) {
                            var usertype = data.usertype;
                            var token = jwt.sign({ login_id: data._id, usertype: usertype, profile_id: pdata._id }, config.secret, {
                                expiresIn: 86400
                            });
                            jsondata.token = token;
                            jsondata.city = pdata.city;
                            jsondata.gender = pdata.gender;
                            let max = 9999;
                            let min = 1000;
                            let otp =   1234;   //Math.floor(Math.random() * (max - min + 1)) + min;
                            var updateData = { token: token, otp: otp , 
                                 lastlogindate : commonfn.Todaydate(), 
                                 totallogin : (data.totallogin +1), 
                                 lastloginip : commonfn.getIp(req) };
            
                            Login.findOneAndUpdate({ _id: data._id }, updateData, { new: true }, function (err, ldata) {
                                if (!err) {
                                    const msg  = otp+' is your SECRET One Time Password (OTP) for Registration/ Login in edisputeresolution.com';
                                    let url = 'http://sms.bulksmsserviceproviders.com/api/send_http.php?username=khushboo123&password=zapyas123&mobiles=' + ldata.mobile + '&message=' + msg + '&sender=EDISPU&route=B'
                                           otpsend(ldata);
                                            return res.status(200).json({
                                                "status": "ok",
                                                "result": jsondata
                                            });
                                    
                                    request(url, function (error, response, body) {
                                        if (!error && response.statusCode == 200) {
                                            otpsend(ldata);
                                            return res.status(200).json({
                                                "status": "ok",
                                                "result": jsondata
                                            });
                                        } else {
                                            otpsend(ldata);
                                            return res.status(200).json({
                                                "status": "ok",
                                                "result": jsondata
                                            });
                                        }
                                    })
                                } else {
                                    return res.status(400).json({
                                        "status": "error",
                                        "result": "Server Error"
                                    });
                                }
                            });
                        }else{
                            return res.status(500).json({
                                "status": "error",
                                "result": "Please Enter Valid Username and Password"
                            });
                        }
                    }).catch(function (err) {
                       // console.log(err);
                        return res.status(400).json({
                            "status": "error",
                            "result": "Please Enter Valid Username and Password"
                        });
                    });
                }else{
                    return res.status(500).json({
                        "status": "error",
                        "result": "Please Enter Valid Password"
                    });
                }
            }).catch(function (err) {
                //console.log(err);
                return res.status(400).json({
                    "status": "error",
                    "result": "Please Enter Valid Username and Password"
                });
            });
        }else{
            return res.status(400).json({
               
                "status": "error",
                "result": "Please Enter Valid Username and Password"
            });
        }
       
    }).catch(function (err) {
        //console.log(err);
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Email"
        });
    });
});
router.post('/register', function (req, res) {
    var body = req.body;
    var todaydate = commonfn.Todaydate();
    var jsonData = {};
    var name = body.name;
    var email = body.email;
    var mobile = body.mobile;
    var city = body.city;
    var gender = body.gender;
    var password = body.password;
    var cpassword = body.cpassword;
    var usertype = body.usertype;
    let Payment = body.partyPayment;

    var requirearr = [
        { "name": "name", "value": name, "required": true },
        { "name": "email", "value": email, "required": true },
        { "name": "mobile", "value": mobile, "required": true },
        { "name": "city", "value": city, "required": true },
        { "name": "password", "value": password, "required": true },
        { "name": "cpassword", "value": cpassword, "required": true },
        { "name": "usertype", "value": usertype, "required": true }
    ];
    var rdata = commonfn.validationvalue(requirearr, res);
    if (rdata != true) {
        return res.status(200).json({
            "status": "error",
            "result": rdata.result
        });
    }

    if (password != cpassword) {
        return res.status(200).json({
            "status": "error",
            "result": "Password miss match"
        });
    }
    jsonData.name = name;
    jsonData.email = email;
    jsonData.mobile = mobile;
    jsonData.city = city;
    jsonData.gender = gender;
    jsonData.password = crypto.createHash('sha256').update(password).digest('base64');
    var userid = name.substring(0, 1) + ids.generate();
    jsonData.usertype = usertype;
    jsonData.createDate = todaydate;
    jsonData.status = 'Pending';
    jsonData.userid = userid;
    if (usertype == 'party' && Payment == 'Party1') {
        jsonData.partyPayment = false;
        jsonData.status = 'Accept';
    } else if (usertype == 'party' && Payment == 'Party2') {
        jsonData.partyPayment = true;
        jsonData.status = 'Accept';
    }
    let max = 9999;
    let min = 1000;
    let otp =  1234;  //Math.floor(Math.random() * (max - min + 1)) + min;
    jsonData.otp =  1234; //otp;
    var filter = { $or: [{ email: email }, { mobile: mobile }] };
    Login.findOne(filter).exec().then(getData => {
        if (getData != null) {
            if (getData.otpverify == 'Pending' && getData.email == email && getData.mobile == mobile) {
                var token = jwt.sign({ login_id: getData._id, usertype: getData.usertype }, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                let jsondata = {};
                jsondata.token = token;
                jsondata.msg = "Your Registration Successfully!";
                let updateData = { otp: otp };
                Login.findOneAndUpdate({ _id: getData._id }, updateData, { new: true }, function (err, ldata) {
                    if (!err) {
                        const msg  = otp+' is your SECRET One Time Password (OTP) for Registration/ Login in edisputeresolution.com';
                        let url = 'http://sms.bulksmsserviceproviders.com/api/send_http.php?username=khushboo123&password=zapyas123&mobiles=' + mobile + '&message=' + msg + '&sender=EDISPU&route=B'
                        otpsend(getData);
                        return res.status(200).json({
                            "status": "ok",
                            "result": jsondata
                        });
                        request(url, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                otpsend(getData);
                                return res.status(200).json({
                                    "status": "ok",
                                    "result": jsondata
                                });
                            } else {
                                otpsend(ldata);
                                return res.status(200).json({
                                    "status": "ok",
                                    "result": jsondata
                                });
                            }
                        });
                    } else {
                        return res.status(200).json({
                            "status": "error",
                            "result": "Allready Register"
                        });
                    }
                });

            } else {
                return res.status(200).json({
                    "status": "error",
                    "result": "Allready Register"
                });
            }

        } else {
            Login.findOne({ mobile: mobile }).exec().then(mData => {
                if (mData != null) {
                    if (mData.otpverify == 'Pending') {
                        var token = jwt.sign({ login_id: getData._id, usertype: getData.usertype }, config.secret, {
                            expiresIn: 86400 // expires in 24 hours
                        });
                        var jsondata = {};
                        jsondata.token = token;
                        jsondata.msg = "Your Registration Successfully!";
                        let updateData = { otp: otp };
                        Login.findOneAndUpdate({ _id: mData._id }, updateData, { new: true }, function (err, ldata) {
                            if (!err) {
                                const msg  = otp+' is your SECRET One Time Password (OTP) for Registration/ Login in edisputeresolution.com';
                                let url = 'http://sms.bulksmsserviceproviders.com/api/send_http.php?username=khushboo123&password=zapyas123&mobiles=' + mobile + '&message=' + msg + '&sender=EDISPU&route=B'
                                otpsend(getData);
                                return res.status(200).json({
                                    "status": "ok",
                                    "result": jsondata
                                });
                                 request(url, function (error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        otpsend(getData);
                                        return res.status(200).json({
                                            "status": "ok",
                                            "result": jsondata
                                        });
                                    } else {
                                        otpsend(mData);
                                        return res.status(200).json({
                                            "status": "ok",
                                            "result": jsondata
                                        });
                                    }
                                });
                            } else {
                                return res.status(200).json({
                                    "status": "error",
                                    "result": "Already Register"
                                });
                            }
                        });
                    } else {
                        return res.status(200).json({
                            "status": "error",
                            "result": "Already Register"
                        });
                    }
                } else {
                    Login.create(jsonData, function (err, data) {
                        if (err) {
                            return res.status(200).json({
                                "status": "error",
                                "result": "Server Error"
                            });
                        }
                        var profile = {};
                        profile.loginid = data._id;
                        profile.name = name;
                        profile.email = email,
                            profile.usertype = usertype;
                        profile.mobile = mobile,
                            profile.city = city;
                        profile.createDate = todaydate
                        if(usertype == 'party'){
                            profile.status = 'Accept';
                        }else{
                            profile.status = 'Pending';
                        }
                       
                        profile.otpverify = 'Pending'
                        Profile.create(profile, function (err, data2) {
                            if (err) {
                                return res.status(200).json({
                                    "status": "error",
                                    "result": "Server Error"
                                });
                            }
                            var token = jwt.sign({ login_id: data._id, usertype: data.usertype, profile_id: data2._id }, config.secret, {
                                expiresIn: 86400 // expires in 24 hours
                            });
                            var jsondata = {};
                            jsondata.token = token;
                            jsondata.msg = "Your Registration Successfully!";
                            let updateData = { otp: otp };
                            Login.findOneAndUpdate({ _id: data._id }, updateData, { new: true }, function (err, ldata) {
                                if (!err) {
                                    const msg  = otp+' is your SECRET One Time Password (OTP) for Registration/ Login in edisputeresolution.com';
                                    let url = 'http://sms.bulksmsserviceproviders.com/api/send_http.php?username=khushboo123&password=zapyas123&mobiles=' + mobile + '&message=' + msg + '&sender=EDISPU&route=B'
                                    otpsend(data);
                                    return res.status(200).json({
                                        "status": "ok",
                                        "result": jsondata
                                    });
                                    request(url, function (error, response, body) {
                                        if (!error && response.statusCode == 200) {
                                            otpsend(data);
                                            return res.status(200).json({
                                                "status": "ok",
                                                "result": jsondata
                                            });
                                        } else {
                                            otpsend(data);
                                            return res.status(200).json({
                                                "status": "ok",
                                                "result": jsondata
                                            });
                                        }
                                    });
                                } else {
                                    return res.status(400).json({
                                        "status": "error",
                                        "result": "Please Enter Valid Username and Password"
                                    });
                                }

                            });

                        });

                    });
                }

            }).catch(function (err) {
                return res.status(400).json({
                    "status": "error",
                    "result": "Please Enter Valid Username and Password"
                });
            });
        }

    }).catch(function (err) {
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    });
});
router.post('/forgotpassword', function (req, res) {
    var body = req.body;
    var email = body.email;
    Login.findOne({ email: email }).exec().then(getData => {
        if (getData == null) {
            return res.status(200).json({
                "status": "error",
                "result": "Email-id not exist"
            });
        } else {
            var data = getData;
            var login_id = getData._id;
            var email = getData.email; 
            var token = jwt.sign({ login_id: login_id, email: email }, config.secret, {
                expiresIn: 3600
            });
            var btnurl = commonfn.baseURL2() + 'app/forgot-password-reset?' + 'token=' + token;
            sendmail(email, getData.name, btnurl);
            return res.status(200).json({
                "status": "ok",
                "result": "Please check mail"
            });
        }
    }).catch(function (err) {
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    }); //admin find close
});
router.post('/resetpassword', PwdVerifyToken, function (req, res, next) {

    var body = req.body;
    ////console.log(body);
    var password = body.password;
    var retypepassword = body.retypepassword;
    var email = req.email;
    var login_id = req.login_id;
    if (password != retypepassword) {
        commonfn.formValidate('Password Miss Match', res);
        return false;
    }
    var filter = { $and: [{ '_id': login_id }, { 'email': email }] };
    Login.findOne(filter).exec().then(getData => {
        if (Object.keys(getData).length > 0) {
            var pwd = crypto.createHash('sha256').update(password).digest('base64');
            var jsonData = {
                password: pwd
            }
            Login.findOneAndUpdate({ _id: login_id }, jsonData, { new: true }, function (err, data) {
                if (err) {
                    return res.status(500).json({
                        "status": "error",
                        "result": "Server Error"
                    });
                }
                return res.status(200).json({
                    "status": "ok",
                    "result": "Password Changeed Successfully"
                });
            });
        } else {
            return res.status(200).json({
                "status": "error",
                "result": "Please enter right mail-id"
            });
        }
    }).catch(function (err) {
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    }); //admin find close
});
router.post('/otpverify', VerifyToken, function (req, res, next) {
    var body = req.body;
    var otp = body.otp;
    var filter = { $and: [{ "_id": req.login_id }, { "otp": otp }] };
    //console.log(filter);
    Login.findOne(filter).exec().then(data => {
        if (data == null) {
            return res.status(500).json({
                "status": "error",
                "result": "Please Enter Valid OTP"
            });
        }
        var usertype = data.usertype;
        if(data.status==='Pending' && usertype =='party'){
            return res.status(200).json({
                status: "Pending",
                result: 'Your Profile did not appove, Please wait'
            });
        }
        if(data.status==='Reject'){
            return res.status(200).json({
                status: "Reject",
                result: 'You are block , Please contact admin'
            });
        }
        var token = jwt.sign({ login_id: data._id, usertype: usertype, profile_id: req.profile_id }, config.secret, {
            expiresIn:   86400 // expires in 24 hours
        });
        var jsondata = {};
        jsondata.email = data.email;
        if (data.usertype == 'admin') {
            jsondata.usertype = 'admin';
        }
        if (data.usertype == 'arbitrator') {
            jsondata.usertype = 'arbitrator';
            jsondata.profilestt = data.profilestt;
        }
        if (data.usertype == 'party') {
            jsondata.usertype = 'party';
            jsondata.partyPayment = data.partyPayment;
        }
        jsondata.address = data.address;
        jsondata.name = data.name;
        jsondata.status = data.status;
        jsondata.usertype = usertype;
        jsondata.lastlogindate = data.todaydate;
        jsondata.token = token;
        jsondata.userid = data.userid;
        Profile.findOne({ "loginid": req.login_id }).exec().then(pdata => {
            if (data == null) {
                return res.status(500).json({
                    "status": "error",
                    "result": "Please Enter Valid Username and Password"
                });
            }
            jsondata.city = pdata.city;
            jsondata.gender = pdata.gender;
            jsondata.profileImg = pdata.profileImg;
            if (data.usertype == 'arbitrator') {
                if (pdata.profileImg == null) {
                    jsondata.profileImg = commonfn.baseURL() + 'images/not_found/user.jpg';
                } else {
                    jsondata.profileImg = commonfn.baseURL() + 'images/personal/' + pdata.profileImg;
                }
            } else {
                if (pdata.profileImg == null) {
                    jsondata.profileImg = commonfn.baseURL() + 'images/not_found/user.jpg';
                } else {
                    jsondata.profileImg = commonfn.baseURL() + 'images/profile/' + pdata.profileImg;
                }
            }
            jsondata.otp = pdata.otp;
            jsondata.profileId = pdata._id;

            var updateData = { "otpverify": 'Success', "otp": null };
            Login.findOneAndUpdate({ _id: req.login_id }, updateData, { new: true }, function (err) {
                if (!err) {
                    return res.status(200).json({
                        "status": "ok",
                        "result": jsondata
                    });

                } else {
                    return res.status(400).json({
                        "status": "error",
                        "result": "Server Error"
                    });
                }
            });
        }).catch(function (err) {
            return res.status(400).json({
                "status": "error",
                "result": "Please Enter Valid Username and Password"
            });
        });
    }).catch(function (err) {
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    });
});
router.post("/checklogin", VerifyToken, function (req, res, next) {
    let body = req.body;
    let filter = { $and: [{ "_id": req.login_id }, { "status": 'Accept' }] };
    //console.log(filter);
    Login.findOne(filter).exec().then(data => {
        if (data == null) {
            return res.status(400).json({
                "status": "error",
                "result": "Please Enter Valid OTP"
            });
        }
        var usertype = data.usertype;
        var token = jwt.sign({ login_id: data._id, usertype: usertype, profile_id: req.profile_id }, config.secret, {
            expiresIn: 86400 //expires in 24 hours
        });
        var jsondata = {};
        jsondata.email = data.email;
        if (data.usertype == 'admin') {
            jsondata.usertype = 'admin';
        }
        if (data.usertype == 'arbitrator') {
            jsondata.usertype = 'arbitrator';
            jsondata.profilestt = data.profilestt;
        }
        if (data.usertype == 'party') {
            jsondata.usertype = 'party';
            jsondata.partyPayment = data.partyPayment;
        }
        jsondata.address = data.address;
        jsondata.name = data.name;
        jsondata.status = data.status;
        jsondata.usertype = usertype;
        jsondata.lastlogindate = data.todaydate;
        jsondata.token = token;
        jsondata.userid = data.userid;
        Profile.findOne({ "loginid": req.login_id }).exec().then(pdata => {
            if (data == null) {
                return res.status(500).json({
                    "status": "error",
                    "result": "Please Enter Valid Username and Password"
                });
            }
            jsondata.city = pdata.city;
            jsondata.gender = pdata.gender;
            jsondata.profileImg = pdata.profileImg;
            if (data.usertype == 'arbitrator') {
                if (pdata.profileImg == null) {
                    jsondata.profileImg = commonfn.baseURL() + 'images/not_found/user.jpg';
                } else {
                    jsondata.profileImg = commonfn.baseURL() + 'images/personal/' + pdata.profileImg;
                }
            } else {
                if (pdata.profileImg == null) {
                    jsondata.profileImg = commonfn.baseURL() + 'images/not_found/user.jpg';
                } else {
                    jsondata.profileImg = commonfn.baseURL() + 'images/profile/' + pdata.profileImg;
                }
            }
            return res.status(200).json({
                "status": "ok",
                "result": jsondata
            });

        }).catch(function (err) {
            return res.status(400).json({
                "status": "error",
                "result": "Please Enter Valid Username and Password"
            });
        });
    }).catch(function (err) {
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    });
});
router.post("/Contact", function (req, res) {
    var body = req.body;
    Contact.create(body, function (err, data) {
        if (!err) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/paymentstt", VerifyToken, function (req, res, next) {
    let login_id = req.login_id;
    let updateData = { partyPayment: true };
    Login.findOneAndUpdate({ _id: login_id }, updateData, { new: true }, function (err) {
        if (!err) {
            return res.status(200).json({
                "result": "successfully Payment"
            });
        } else {
            return res.status(400).json(err);
        }

    });
});
router.get("/notKnow", VerifyToken, function (req, res, next) {
    let login_id = req.login_id;

    Login.findOne({ _id: login_id }, function (err ,data) {
        if (!err) {
            sendCaseinfo({ email: data.email , name :data.name , mobile:data.mobile });
            return res.status(200).json({
                "result": "successfully Payment"
            });
        } else {
            return res.status(400).json(err);
        }

    });
});
function sendmail(toemail, name, btnurl) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'zaptastest@gmail.com',
            pass: 'Rsg@gmail9'

        }
    });
    // user: 'edisputecontact@gmail.com',
    // pass: 'edispute123'
    // user: 'zaptastest@gmail.com',
    //         pass: 'Rsg@gmail9'
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
            ////console.log(error);
        } else {
            return true;
            //////console.log('Email sent: ' + info.response);
        }
    });
}
function enquirydmail(toemail, name, btnurl) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'zaptastest@gmail.com',
            pass: 'Rsg@gmail9'
        }
    });
    var temp = commonfn.enquirytemp();
    var mapObj = {
        '{name}': name,
        '{action_url}': 'http://localhost:4200/home'
    };
    temp = temp.replace(/{name}|{action_url}/gi, function (matched) {
        return mapObj[matched];
    });
    //alert(temp);
    //////console.log(temp);
    var mailOptions = {
        from: 'zaptastest@gmail.com',
        to: toemail,
        subject: 'Contact Us',
        html: temp
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            ////console.log(error);
        } else {
            ////console.log('Email sent: ' + info.response);
        }
    });
}
function otpsend(jsondata) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'zaptastest@gmail.com',
            pass: 'Rsg@gmail9'

        }
    });
    var temp = commonfn.otptemp();
    var mapObj = {
        '{name}': jsondata.name,
        '{code}': jsondata.otp,
        '{action_url}': 'http://arbitration.zaptas.com:3001/'
    };
    temp = temp.replace(/{name}|{code}|{action_url}/gi, function (matched) {
        return mapObj[matched];
    });
    var mailOptions = {
        from: 'edisputecontact@gmail.com',
        to: jsondata.email,
        subject: 'Verification Code',
        html: temp
    };
    
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            //return true;
            console.log('Email sent: ' + info.response);
        }
    });
}
function sendCaseinfo(jsondata) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'zaptastest@gmail.com',
            pass: 'Rsg@gmail9'

        }
    });

   let temp = '<div> Name  : '+ jsondata.name +' <br> ';
    temp += '<div> Email  : '+ jsondata.email +' <br> ';
    temp += '<div> Mobile  : '+ jsondata.mobile +' <br> ';
    temp += '<p> Party do not know the claim amount, So please contact .. </p> <br> ';
    temp += ' </div> ';
    var maillist = [
        'shiv.pratap@zaptas.com',
        'amit.t@sociorich.com',
        'pranjal.jain1094@gmail.com',
      ];
    var mailOptions = {
        from: 'edisputecontact@gmail.com',
        to: maillist,
        subject: 'Not know the claim amount',
        html: temp
    };
    
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            return true;
            //console.log('Email sent: ' + info.response);
        }
    });
}
module.exports = router;