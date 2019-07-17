var app = require('express');
var router = app.Router();
var Login = require('../schemas/login');
var Personal = require('../schemas/personaldetails');
var Education = require('../schemas/education');
var Professional = require('../schemas/professional');
var Public = require('../schemas/publicprofile');
var Fees = require('../schemas/arbitrationfees');
var Bank = require('../schemas/bankinfoarbitration');
var multer = require('multer');
var commonfn = require('../../common');
var VerifyToken = require('../../VerifyToken');
var nodemailer = require('nodemailer');
/* milter for upload images */

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
    }).any(); //file storage path
    return upload;
}
/* root for flight */
router.get("/", function (req, res, next) {
    return res.status(400).json({
        "status": "error",
        "result": "Bad request"
    });
});
/* Login request for admin */
router.post("/Create", VerifyToken, function (req, res, next) {
    var body = req.body;
    var login_id = req.login_id;
    var usertype = req.usertype;
    //console.log(body);
    var jsondata = {};
    if (Array.isArray(itemRows) == false) {
        return res.status(200).json({
            "status": "error",
            "result": "Please Enter Educational Details"
        });
    }
    jsondata.loginid = login_id;
    jsondata.createDate = commonfn.Todaydate();
    jsondata.achievement_societies = body.achievement_societies;
    jsondata.educationaldetails = body.itemRows;

    Education.findOne({ loginid: login_id }).exec().then(getData => {
        if (getData == null) {
            Education.create(jsondata, function (err, data) {
                if (err) {
                    return res.status(400).json(err);
                }
            });
            return res.status(200).json({
                "status": "ok",
                "result": "Education Added Successfully!!"
            });
        }
        return res.status(200).json({
            "status": "ok",
            "result": "Allreay added Education"
        });
    }).catch(function (err) {
        console.log(err);
        return res.status(400).json(err);
    }); //admin find close

});
router.post("/Update", VerifyToken, function (req, res, next) {
    var body = req.body;
    var login_id = req.login_id;
    var usertype = req.usertype;
    //console.log(body);
    var jsondata = {};
    if (Array.isArray(itemRows) == false) {
        return res.status(200).json({
            "status": "error",
            "result": "Please Enter Educational Details"
        });
    }
    jsondata.loginid = login_id;
    jsondata.createDate = commonfn.Todaydate();
    jsondata.achievement_societies = body.achievement_societies;
    jsondata.educationaldetails = body.itemRows;

    Login.findOne({ _id: login_id }).exec().then(getData => {
        if (getData == null) {
            return res.status(400).json({ "error": "access denied" });
        }
        Education.findOneAndUpdate({ _id: body.education_id }, jsonData, { new: true }, function (err, updatedata) {
            if (err) {
                return res.status(400).json({ "error": "server error" });
            }
            return res.status(200).json({
                "status": "ok",
                "result": "Updated Successfully"
            });
        }); //find and update close
    }).catch(function (err) {
        console.log(err);
        return res.status(400).json(err);
    }); //admin find close
});
router.post("/Find", VerifyToken, function (req, res, next) {
    Login.findOne({ _id: req.login_id }).exec().then(getData => {
        if (getData == null) {
            return res.status(400).json({ "error": "access denied" });
        }
        Education.find({"status":"Active"}, function (err, data) {
            if (err) {
                return res.status(400).json({ "error": "server error" });
            }
            return res.status(200).json(data);
        }); //find and update close
    }).catch(function (err) {
       // console.log(err);
        return res.status(400).json(err);
    }); //admin find close
});
router.post("/Findbyid/:id", VerifyToken, function (req, res, next) {
    var body = req.body;
    Login.findOne({ _id: req.login_id }).exec().then(getData => {
        if (getData == null) {
            return res.status(400).json({ "error": "access denied" });
        }
        var filter = { $and:[{"status":"Active"},{"_id":body.education_id}]};
        Education.findOne(filter, function (err, data) {
            if (err) {
                return res.status(400).json({ "error": "server error" });
            }
            return res.status(200).json(data);
        }); //find and update close
    }).catch(function (err) {
       // console.log(err);
        return res.status(400).json(err);
    }); //admin find close
});
router.post("/Remove", VerifyToken, function (req, res, next) {
    var body = req.body;
    Login.findOne({ _id: req.login_id }).exec().then(getData => {
        if (getData == null) {
            return res.status(400).json({ "error": "access denied" });
        }
        var filter = { $and:[{"status":"Active"},{"_id":body.education_id}]};
            Education.findByIdAndRemove({ _id: program_id }, function (err) {
                if (err) {
                    return res.status(200).json(err);
                }
                return res.status(200).json({"result": "Education Removed Successfully!!"});
            });
    }).catch(function (err) {
       // console.log(err);
        return res.status(400).json(err);
    }); //admin find close

});
// Upoad file not here for this api
router.post("/Uploadfile", VerifyToken, function (req, res, next) {
    Login.findOne({ _id: req.login_id }).exec().then(getData => {
        if (getData == null) {
            console.log(err);
            return res.status(200).json({
                "status": "error",
                "result": "Access Denied"
            });
        }


    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
module.exports = router;