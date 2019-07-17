var app = require('express');
var router = app.Router();
var ids = require('short-id');
var Login = require('../schemas/adminLogin');;
var crypto = require('crypto');
var multer = require('multer');
var commonfn = require('../../common');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var VerifyToken = require('../../adminVerifyToken');
var PwdVerifyToken = require('../../adminPwdVerifyToken');
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
router.get("/Find", VerifyToken, function (req, res) {
    var filter = { "Usertype": "subAdmin" };
    Login.find(filter).sort({CreatedAt : -1}).populate('CreatedBy', 'Name Email _id').exec().then(getData => {
        return res.status(200).json(getData);
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
router.get("/FindbyId/:AdminId", VerifyToken, function (req, res) {
    let AdminId = req.params.AdminId;
    Login.findOne({ _id: AdminId }).populate('CreatedBy', 'Name Email _id').exec().then(getData => {
        return res.status(200).json(getData);
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
/* Login request for admin */
router.post("/login", function (req, res, next) {
    let body = req.body;
    let todaydate = commonfn.Todaydate();
    if (body.Email == '' || !body.Email || body.Email == undefined) {
        return res.status(400).json({
            "error": "Please Enter Email"
        });
    }
    if (body.Password == '' || !body.Password || body.Password == undefined) {
        return res.status(400).json({
            "error": "Please Enter Password"
        });
    }
    let hash = crypto.createHash('sha256').update(body.Password).digest('base64');
    let deletefind = { $and: [{ "Email": body.Email }, { "Status": 'Active' }] };
    Login.findOne(deletefind).exec().then(getData => {
        if (getData != null) {
            let datafind = { $and: [{ "Email": body.Email }, { "Password": hash }] };
            Login.findOne(datafind).exec().then(data => {
                if (data != null) {
                    let resData = {};
                    let token = jwt.sign({ AdminId: data._id, usertype: data.Usertype }, config.secret, {
                        expiresIn: 86400 * 10
                    });
                    resData.Address = data.Address;
                    resData.Name = data.Name;
                    resData.Email = data.Email;
                    resData.Address = data.Address;
                    resData.Phone = data.Phone;

                    let updateData = {
                        totalLogin: (data.totalLogin + 1),
                        lastLogindate: todaydate
                    }
                    Login.findOneAndUpdate({ _id: data._id }, updateData, { new: true }, function (err, udata) {
                        if (!err) {
                            resData.totalLogin = udata.totalLogin;
                            resData.lastLogindate = udata.lastLogindate;
                            return res.status(200).json({ "token": token, "userdata": resData });
                        } else {
                            return res.status(400).json({
                                "status": "error",
                                "result": "Server Error"
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
        } else {
            return res.status(400).json({
                "error": "Please Enter Valid Username and Password!!"
            });
        }
    }).catch(function (err) {
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    });
});
router.post('/Create', VerifyToken, function (req, res, next) {
    let body = req.body;
    let todaydate = commonfn.Todaydate();
    let jsonData = {};
    let AdminId = req.AdminId;
    jsonData.Name = body.Name;
    jsonData.Email = body.Email;
    jsonData.Phone = body.Phone;
    jsonData.Address = body.Address;
    jsonData.Usertype = body.Usertype;
    jsonData.CreatedAt = todaydate;
    jsonData.CreatedBy = AdminId;
    jsonData.Status = 'Active';
    jsonData.Password = crypto.createHash('sha256').update('123456').digest('base64');
    let Userid = body.Email.substring(0, 1) + ids.generate()
    jsonData.Userid = Userid;
    let filter = { $or: [{ Email: body.Email }, { Phone: body.Phone }] };
    Login.findOne(filter).exec().then(getData => {
        if (getData == null) {

            Login.create(jsonData, function (err, data) {
                if (!err) {
                    var token = jwt.sign({ AdminId: data._id, Email: data.Email }, config.secret, {
                        expiresIn: 3600
                    });
                    var btnurl = commonfn.adminbaseUrl2() + 'reset-password?' + 'token=' + token;
                    sendmailsubadmin(data.Email, data.Name, btnurl);
                    return res.status(200).json(data);
                } else {
                    return res.status(400).json(err);
                }
            });
           
        } else {
            return res.status(400).json({
                "status": "error",
                "result": "Already Registered"
            });
        }
    }).catch(function (err) {
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    });
});
router.put('/Update', VerifyToken, function (req, res, next) {
    let body = req.body;
    let todaydate = commonfn.Todaydate();
    let jsonData = {};
    jsonData.Name = body.Name;
    jsonData.Address = body.Address;
    jsonData.UpdatedAt = todaydate;
    let filter = { _id: body.AdminId };
    Login.findOneAndUpdate(filter, jsonData, { new: true }, function (err, data) {
        if (err) {
            return res.status(400).json(data);
        }
        return res.status(200).json(err);
    });
});
// forgot password 
router.post('/forgotpassword', function (req, res) {
    let body = req.body;
    //console.log(body);
    Login.findOne({ Email: body.Email }).exec().then(getData => {
        
        if (getData != null) {
            //console.log(getData);
            var token = jwt.sign({ AdminId: getData._id, Email: getData.Email }, config.secret, {
                expiresIn: 3600
            });
            var btnurl = commonfn.adminbaseUrl2() + 'reset-password?' + 'token=' + token;
            sendmail(getData.Email, getData.Name, btnurl);
            return res.status(200).json({
                "msg": "Please check mail"
            });
           
        } else {
            return res.status(400).json({ "error": "Email-id not exist" });
        }
    }).catch(function (err) {
        //console.log(err);
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    });
});
// reset password
router.post('/resetpassword', PwdVerifyToken, function (req, res, next) {
    let body = req.body;
    if (body.Password != body.retypePassword) {
        return res.status(400).json({
            "error": "Password Miss Match"
        });
    }
    //console.log(req);
    var filter = { $and: [{ '_id': req.AdminId }, { 'Email': req.Email }] };
    Login.findOne(filter).exec().then(getData => {
        if (getData != null) {
            var pwd = crypto.createHash('sha256').update(body.Password).digest('base64');
            var jsonData = {
                Password: pwd
            }
            Login.findOneAndUpdate({ _id: req.AdminId }, jsonData, { new: true }, function (err, data) {
                if (err) {
                    return res.status(400).json({
                        "error": "Please Try After Some Time"
                    });
                }
                return res.status(200).json({ "msg": "Password Changeed Successfully" });
            });
        } else {
            return res.status(400).json({
                "error": "Please enter right mail-id"
            });
        }
    }).catch(function (err) {
        return res.status(400).json({
            "error": "Please Enter Valid Username and Password"
        });
    });
});
// check login Api
router.post("/checklogin", VerifyToken, function (req, res, next) {
    let datafind = { $and: [{ "_id": req.AdminId }, { "Status": "Active" }] };
    Login.findOne(datafind).exec().then(data => {
        if (data != null) {
            let resData = {};
            let token = jwt.sign({ AdminId: data._id, usertype: data.Usertype }, config.secret, {
                expiresIn: 86400 * 10
            });
            resData.Address = data.Address;
            resData.Name = data.Name;
            resData.Email = data.Email;
            resData.Address = data.Address;
            resData.Phone = data.Phone;
            resData.totalLogin = data.totalLogin;
            resData.lastLogindate = data.lastLogindate;
            return res.status(200).json({ "token": token, "userdata": resData });
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
router.post('/Status', VerifyToken, function (req, res, next) {
    let body = req.body;
    let todaydate = commonfn.Todaydate();
    let jsonData = {};
    jsonData.Status = body.Status;
    let filter = { _id: body.AdminId };
    Login.findOneAndUpdate(filter, jsonData, { new: true }, function (err, data) {
        if (err) {
            return res.status(400).json(data);
        }
        return res.status(200).json(err);
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
            console.log(error);
        } else {
            return true;
            //console.log('Email sent: ' + info.response);
        }
    });
}
function sendmailsubadmin(toemail, name, btnurl) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'zaptastest@gmail.com',
            pass: 'Rsg@gmail9'

        }
    });

    // user: 'edisputecontact@gmail.com',
    //         pass: 'edispute123'
    // user: 'zaptastest@gmail.com',
    //         pass: 'Rsg@gmail9'
    var temp = commonfn.adminforgotpwdtemp();
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
    //console.log(mailOptions);
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
            //console.log('send');
            return true;
            //console.log('Email sent: ' + info.response);
        }
    });
}
module.exports = router;