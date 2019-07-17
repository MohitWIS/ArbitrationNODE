var app = require('express');
var router = app.Router();
var Personal = require('../schemas/personaldetails');
var Login = require('../schemas/login');
var multer = require('multer');
var commonfn = require('../../common');
var VerifyToken = require('../../VerifyToken');
var Profile = require('../schemas/profile');
/* milter for upload images */
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

router.get("/", function (req, res, next) {
    return res.status(400).json({
        "status": "error",
        "result": "Bad request"
    });
});
router.get("/Find", VerifyToken, function (req, res, next) {
    Personal.find({ "status": "Active" }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ "error": "server error" });
        }
    });
});
router.get("/Findbyid", VerifyToken, function (req, res, next) {
    var filter = { $and: [{ "status": "Active" }, { "loginid": req.login_id }] };
    Personal.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
router.get("/party/Findbyid/:loginId", VerifyToken, function (req, res, next) {
    let loginId = req.params.loginId;
    var filter = { $and: [{ "status": "Active" }, { "loginid": loginId }] };
    Personal.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
router.post("/Create", VerifyToken, function (req, res, next) {
    var currUpload = setupload_dir('personal');
    currUpload(req, res, function (err) {
        if (err) {
            //console.log(err);
            return res.status(200).json({
                "status": "error",
                "result": "Please upload only jpg and png image!"
            });
        }
        var body = req.body ? req.body : '';
        var jsondata = {
            loginid: req.login_id,
            firstname: body.firstname,
            middlename: body.middlename,
            lastname: body.lastname,
            dob: body.dob,
            nationality: body.nationality,
            gender: body.gender,
            fathername: body.fathername,
            alternatemobile: body.alternatemobile,
            address_gov: body.address_gov,
            pincode: body.pincode,
            createDate: commonfn.Todaydate()
        };
       // //console.log(req.files);
        for (var i = 0; i < req.files.length; i++) {
            if (req.files[i].fieldname == "pancard") {
                jsondata.pancard = req.files[i].filename;
            } else if (req.files[i].fieldname == "photograph") {
                jsondata.photograph = req.files[i].filename;
            }
        }
        let namefull = body.firstname +' ' + body.middlename +' '+body.lastname;
        Personal.create(jsondata, function (err, data) {
            if (data) {
                Login.findOneAndUpdate({ _id: req.login_id }, { 'profilestt.Personal': true , name :  namefull }, { new: true }, function (err) {
                    if (!err) {
                        //console.log(jsondata.photograph);
                        Profile.findOneAndUpdate({ loginid: req.login_id }, { 'profileImg': jsondata.photograph , name :  namefull }, { new: true }, function (err) {
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
            } else {
                return res.status(400).json(err);
            }
        });
    });
});
router.put("/Update", VerifyToken, function (req, res, next) {
    var currUpload = setupload_dir('personal');
    currUpload(req, res, function (err) {
        if (err) {
            //console.log(err);
            return res.status(200).json({
                "status": "error",
                "result": "Please upload only jpg and png image!"
            });
        }
        var body = req.body ? req.body : '';
        var jsondata = {
            loginid: req.login_id,
            firstname: body.firstname,
            middlename: body.middlename,
            lastname: body.lastname,
            dob: body.dob,
            nationality: body.nationality,
            gender: body.gender,
            fathername: body.fathername,
            alternatemobile: body.alternatemobile,
            address_gov: body.address_gov,
            pincode: body.pincode,
            updateDate: commonfn.Todaydate()
        };
        for (var i = 0; i < req.files.length; i++) {
            if (req.files[i].fieldname == "pancard") {
                jsondata.pancard = req.files[i].filename;
            } else if (req.files[i].fieldname == "photograph") {
                jsondata.photograph = req.files[i].filename;
            }
        }
        Personal.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
            if (!err) {
                Profile.findOneAndUpdate({ loginid: req.login_id }, { 'profileImg': jsondata.photograph, name: body.firstname + ' ' + body.middlename + ' ' + body.lastname }, { new: true }, function (err) {
                    if (!err) {
                        Login.findOneAndUpdate({ _id: req.login_id }, { "name": body.firstname + ' ' + body.middlename + ' ' + body.lastname }, { new: true }, function (err) {
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
            } else {
                return res.status(400).json(err);
            }
        });
    });
});
router.delete("/Remove", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var filter = { $and: [{ "status": "Active" }, { "_id": body.education_id }] };
    Personal.findByIdAndRemove({ _id: personal_id }, function (err) {
        if (err) {
            return res.status(200).json(err);
        }
        return res.status(200).json({ "result": "Education Removed Successfully!!" });
    });
});
// Upoad file 
router.put("/Uploadfile", VerifyToken, function (req, res, next) {
    var currUpload = setupload_dir('personal');
    currUpload(req, res, function (err) {
        if (err) {
            return res.status(200).json({
                "status": "error",
                "result": "Please upload only jpg and png image!"
            });
        }
        var jsondata = {};
        var files = req.files;
        for (let i = 0; i < files.length; i++) {
            if (files[i].fieldname == 'pancard') {
                jsondata.pancard = files[i].filename;
            }
            if (files[i].fieldname == 'photograph') {
                jsondata.photograph = files[i].filename;
            }
        }
        Personal.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
            if (!err) {
                if (files[i].fieldname == 'photograph') {
                    Profile.findOneAndUpdate({ loginid: req.login_id }, { 'profileImg': jsondata.photograph }, { new: true }, function (err) {
                        if (!err) {
                            return res.status(200).json(data);

                        } else {
                            return res.status(400).json(err);
                        }
                    });
                } else {
                    return res.status(200).json(data);
                }

            } else {
                return res.status(400).json(err);
            }
        });

    });
});
router.put("/getotp", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        address_gov: body.address_gov,
        pincode: body.pincode,
    };
    Personal.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/Update/profile", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        firstname: body.firstname,
        middlename: body.middlename,
        lastname: body.lastname,
        noofcase: body.noofcase,
        updateDate: commonfn.Todaydate()
    };

    Personal.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/image/Remove", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        photograph: null,
        updateDate: commonfn.Todaydate()
    };

    Personal.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
module.exports = router;