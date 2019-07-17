var app = require('express');
var router = app.Router();
var Login = require('../schemas/login');
var Education = require('../schemas/education');
var commonfn = require('../../common');
var VerifyToken = require('../../VerifyToken');
var nodemailer = require('nodemailer');
/* root for education */

router.get("/Find", VerifyToken, function (req, res, next) {
    Education.find({ "status": "Active" }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ "error": "server error" });
        }
    });
});
router.get("/Findbyid", VerifyToken, function (req, res, next) {

    var filter = { $and: [{ "status": "Active" }, { "loginid": req.login_id }] };
    Education.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
router.get("/party/Findbyid/:loginId", VerifyToken, function(req, res, next) {
    let loginId =req.params.loginId;
    console.log(loginId);
    var filter = { $and: [{ "status": "Active" }, { "loginid": loginId }] };
    Education.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
/* education create */
router.post("/Create", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    ////console.log(body); return false;
    var jsondata = {
        loginid: req.login_id,
        createDate: commonfn.Todaydate(),
        achievement_societies: body ? body.achievement_societies : '',
        educationaldetails: body ? body.itemRows : ''
    };
    Education.create(jsondata, function (err, data) {
        if (data) {
            Login.findOneAndUpdate({ _id: req.login_id }, { 'profilestt.Education': true }, { new: true }, function (err) {
                if (data) {
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
router.put("/Update", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    //console.log(body);
    var jsondata = {
        loginid: req.login_id,
        createDate: commonfn.Todaydate(),
        achievement_societies: body ? body.achievement_societies : '',
        educationaldetails: body ? body.itemRows : ''
    };
    Education.findOneAndUpdate({ _id: body.education_id }, jsondata, { new: true }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.delete("/Remove", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var filter = { $and: [{ "status": "Active" }, { "_id": body.education_id }] };
    Education.findByIdAndRemove({ _id: program_id }, function (err) {
        if (err) {
            return res.status(200).json(err);
        }
        return res.status(200).json({ "result": "Education Removed Successfully!!" });
    });
});
router.post("/Push", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = { 
        universitycollege: body ? body.universitycollege : '',
        field_of_study: body ? body.field_of_study : '',
        degree: body ? body.degree : '',
        grade: body ? body.grade : '',
        from_year: body ? body.from_year : '',
        to_year: body ? body.to_year : '',
        description: body ? body.description : ''
    };
    Education.findOneAndUpdate({ loginid: req.login_id }, { $push: { educationaldetails: jsondata } },{ new: true}, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/sub/Update", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    console.log(body);
    var jsondata = { 
        'educationaldetails.$.universitycollege': body ? body.universitycollege : '',
        'educationaldetails.$.field_of_study': body ? body.field_of_study : '',
        'educationaldetails.$.degree': body ? body.degree : '',
        'educationaldetails.$.grade': body ? body.grade : '',
        'educationaldetails.$.from_year': body ? body.from_year : '',
        'educationaldetails.$.to_year': body ? body.to_year : '',
        'educationaldetails.$.description': body ? body.description : ''
    };
    //console.log(jsondata);
    Education.findOneAndUpdate({ 'educationaldetails._id': body.id}, { $set: jsondata },  { new: true },function(err ,data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/societies/Update", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    //console.log(body);
    var jsondata = {
        achievement_societies: body ? body.achievement_societies : '',
    };
    Education.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/sub/Remove", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    console.log(body);
    Education.findOneAndUpdate({ "loginid": req.login_id}, {$pull: {"educationaldetails": { "_id": { $in: body.edu_details_id } }}}, { "multi": true}, function(err, flights) {
        if (!err) {
            return res.status(200).json({
                "msg": "Successfully deleted"
            });
        } else {
            return res.status(400).json(err);
        }
    }); //Package find and update close
    //console.log(jsondata);
});

module.exports = router;