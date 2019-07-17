var app = require('express');
var router = app.Router();
var Bank = require('../schemas/bankinfoarbitration');
var Login = require('../schemas/login');
var commonfn = require('../../common');
var VerifyToken = require('../../VerifyToken');

router.get("/", function (req, res, next) { 
    return res.status(500).json({
        "status": "error",
        "result": "Bad request"
    }); 
});
router.get("/Find", VerifyToken, function (req, res, next) {
    Bank.find({ "status": "Active" }, function(err, data) {
        if (data) {
            return res.status(200).json(data);
        }else{
            return res.status(400).json({ "error": "server error" });
        }
    }); 
});
router.get("/Findbyid", VerifyToken, function(req, res, next) {
    var filter = { $and: [{ "status": "Active" }, { "loginid": req.login_id}] };
    Bank.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
router.get("/party/Findbyid/:loginId", VerifyToken, function(req, res, next) {
    let loginId =req.params.loginId;
    let filter = { $and: [{ "status": "Active" }, { "loginid": loginId }] };
    Bank.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
router.post("/Create", VerifyToken, function(req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        loginid : req.login_id,
        createDate : commonfn.Todaydate(),
        beneficiary_name : body ? body.beneficiary_name : '',
        bank_name : body ? body.bank_name : '',
        account_number : body ? body.account_number : '',
        IFSC_code : body ? body.IFSC_code : '',
        account_type : body ? body.account_type : '',
    };
    Bank.create(jsondata, function (err, data) {
        if (data) {
            Login.findOneAndUpdate({ _id: req.login_id }, { 'profilestt.Bank' : true}, { new: true }, function (err) {
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
   
    var jsondata = {
        beneficiary_name : body ? body.beneficiary_name : '',
        bank_name : body ? body.bank_name : '',
        account_number : body ? body.account_number : '',
        IFSC_code : body ? body.IFSC_code : '',
        account_type : body ? body.account_type : '',
        updateDate : commonfn.Todaydate(),
    };
    //console.log(jsondata);
    Bank.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
        if (data) {
            console.log(data)
            return res.status(200).json(data);
        } else {
            console.log(err)
            return res.status(400).json(err);
        }
    });
});
router.delete("/Remove", VerifyToken, function(req, res, next) {
        var body = req.body? req.body : '';
        var filter = { $and: [{ "status": "Active" }, { "_id": body.education_id }] };
        Bank.findByIdAndRemove({ _id: bank_id }, function (err) {
            if (err) {
                return res.status(200).json(err);
            }
            return res.status(200).json({ "result": "Education Removed Successfully!!" });
        });
});
module.exports = router;