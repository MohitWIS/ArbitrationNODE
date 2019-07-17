var app = require('express');
var router = app.Router();
var Education = require('../schemas/education');
var Login = require('../schemas/login');
var Fees = require('../schemas/arbitrationfees');
var commonfn = require('../../common');
var VerifyToken = require('../../VerifyToken');

router.get("/", function (req, res, next) { 
    return res.status(500).json({
        "status": "error",
        "result": "Bad request"
    });
});
router.get("/Find", VerifyToken, function (req, res, next) {
    Fees.find({ "status": "Active" }, function(err, data) {
        if (data) {
            return res.status(200).json(data);
        }else{
            return res.status(400).json({ "error": "server error" });
        }
    }); 
});
router.get("/Findbyid", VerifyToken, function(req, res, next) {
    var filter = { $and: [{ "status": "Active" }, { "loginid": req.login_id }] };
    Fees.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
router.get("/party/Findbyid/:loginId", VerifyToken, function(req, res, next) {
    let loginId =req.params.loginId;
    let filter = { $and: [{ "status": "Active" }, { "loginid": loginId }] };
    Fees.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
/* education create */
router.post("/Create", VerifyToken, function(req, res, next) {
    var body = req.body ? req.body : '';
     //console.log(body); return false;
    var jsondata = {
        loginid : req.login_id,
        createDate : commonfn.Todaydate(),
        arbitration_fee : body ? body.arbitration_fee : '',
    };
    Fees.create(jsondata, function (err, data) {
        if (data) {
            Login.findOneAndUpdate({ _id: req.login_id }, { 'profilestt.Fees' : true}, { new: true }, function (err) {
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
router.put("/Update", VerifyToken, function(req, res, next) {
    var body = req.body ? req.body : '';
    console.log(body);
    var jsondata = {
        loginid : req.login_id,
        updateDate : commonfn.Todaydate(),
        arbitration_fee : body ? body.arbitration_fee : ''
    };
    Fees.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.delete("/Remove", VerifyToken, function(req, res, next) {
        var body = req.body? req.body : '';
        var filter = { $and: [{ "status": "Active" }, { "_id": body.education_id }] };
        Fees.findByIdAndRemove({ _id: fees_id }, function (err) {
            if (err) {
                return res.status(200).json(err);
            }
            return res.status(200).json({ "result": "Education Removed Successfully!!" });
        });
});

module.exports = router;