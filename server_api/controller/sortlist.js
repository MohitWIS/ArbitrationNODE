var app = require('express');
var router = app.Router();
var Short = require('../schemas/sortlist');
var multer = require('multer');
var commonfn = require('../../common');
var VerifyToken = require('../../VerifyToken');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var Involve = require('../schemas/caseinvolve');
var Case = require('../schemas/cases');

router.get("/", function (req, res, next) {
    return res.status(400).json({
        "status": "error",
        "result": "Bad request"
    });
});
router.post("/Find", VerifyToken, function (req, res, next) {
    var body = req.body;
    console.log(body);
    let profilefilter = { $and: [] };
    let feesFilter = {};
    if (body.name) {
        profilefilter.$and.push({ "name": { $regex: body.name, $options: 'i' } });
    }
    if (body.location.length > 0) {
        profilefilter.$and.push({ "city": { "$in": body.location } });
    }
    if (body.max) {
        feesFilter = { arbitration_fee: { $gte: body.min, $lte: body.max } };
    }
    if (profilefilter.$and.length == 0) {
        profilefilter.$and.push({});
    }
    Short.find({ profileId: req.profile_id })
        .populate({ path: 'case_id' })
        .populate({ path: 'arbitrator_id', match: profilefilter })
        .populate({ path: 'professional_id', match: {} }).
        populate({ path: 'fees_id', match: feesFilter }).exec().then(rData => {
            let arr = [];
            for (let i = 0; i < rData.length; i++) {
                if (rData[i].case_id != null && rData[i].arbitrator_id != null && rData[i].fees_id != null) {
                    arr.push({
                        case_id: rData[i].case_id,
                        case_id: rData[i].case_id,
                        arbitrator_id: rData[i].arbitrator_id,
                        professional_id: rData[i].professional_id,
                        fees_id: rData[i].fees_id,
                        _id: rData[i]._id
                    });
                }
            }
            // console.log(arr);
            return res.status(200).json(arr);
        }).catch(function (err) {
            console.log(err);
            return res.status(400).json(err);
        });
});
router.get("/Findbyid/:short_id", VerifyToken, function (req, res, next) {
    var filter = { $and: [{ "status": "Active" }, { "_id": req.param.short_id }] };
    Short.findOne(filter, function (err, data) {
        if (!err) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ "error": "server error" });
        }
    });
});
router.post("/Create", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    let profileId = req.profile_id;
    for (let i = 0; i < body.length; i++) {
        body[i].profileId = profileId;
    }
    console.log(body);
    Short.insertMany(body).then(function (data) {
        return res.status(200).json(data);
    })
        .catch(function (err) {
            return res.status(400).json(err);
        });
});
router.put("/Remove", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    Short.findByIdAndRemove({ _id: body.sort_id }, function (err, data) {
        if (!err) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ "error": "server error" });
        }

    });
});
router.post("/Sort/Find", VerifyToken, function (req, res, next) {
    var body = req.body;
    let caseFilter = {};
    if (body.caseId) {
        caseFilter._id = body.caseId;
    }
    console.log(body);
    Short.find({ loginId: req.login_id })
        .populate({ path: 'case_id', match: caseFilter })
        .populate({ path: 'arbitrator_id' })
        .populate({ path: 'professional_id' }).
        populate({ path: 'fees_id' }).exec().then(rData => {
            console.log(rData);
            let arr = [];
            for (let i = 0; i < rData.length; i++) {
                if (rData[i].case_id != null && rData[i].arbitrator_id != null && rData[i].fees_id != null) {
                    arr.push({
                        "_id": rData[i].arbitrator_id._id,
                        "loginid": rData[i].arbitrator_id.loginid,
                        "city": rData[i].arbitrator_id.city,
                        "usertype": rData[i].arbitrator_id.usertype,
                        "profileImg": rData[i].arbitrator_id.profileImg,
                        "createDate": rData[i].arbitrator_id.createDate,
                        "name": rData[i].arbitrator_id.name,
                        "experience": rData[i].professional_id != null ? rData[i].professional_id.total_Years_Working_Arbitration : null,
                        "professional_id": rData[i].professional_id != null ? rData[i].professional_id._id : null,
                        "fees_id": rData[i].fees_id._id,
                        "functional_area_arbitration": rData[i].professional_id != null ? rData[i].professional_id.functional_area_arbitration : null,
                        "fees": rData[i].fees_id.arbitration_fee

                    });
                }
            }

            return res.status(200).json(arr);
        }).catch(function (err) {
            console.log(err);
            return res.status(400).json(err);
        });
});
router.post("/appoint/list", function (req, res, next) {
    const body = req.body;
    console.log(body);
    let profilefilter = { $and: [] };
    let feesFilter = {};
    if (body.name) {
        profilefilter.$and.push({ "name": { $regex: body.name, $options: 'i' } });
    }
    if (body.max) {
        feesFilter = { claim_amount: { $gte: body.min, $lte: body.max } };
    }
    if (profilefilter.$and.length == 0) {
        profilefilter.$and.push({});
    }
    const filter2 = { $and: [{ casestt: 'COMPLETED' }] };

    Involve.find(filter2).populate({ path: 'case_id', match: feesFilter })
        .populate('party1.p1_loginid', 'name city address profileImg _id')
        .populate({ path: 'arbitrator1b2b.arbitrator', match: profilefilter })
        .populate({ path: 'scenario3b.p1arbitrator', match: profilefilter })
        .exec().then(rData => {
            // console.log(rData);
            let arr = [];
            let arbitrator = {};
            for (let i = 0; i < rData.length; i++) {
                if(rData[i].arbitrator1b2b.arbitrator != null || rData[i].scenario3b.p1arbitrator != null){
                    arbitrator = {};
                if (rData[i].arbitrator1b2b.arbitrator != null) {
                    arbitrator = rData[i].arbitrator1b2b.arbitrator;
                } else {
                    arbitrator = rData[i].scenario3b.p1arbitrator;
                }
                arr.push({
                    case_id: rData[i].case_id,
                    case_id: rData[i].case_id,
                    arbitrator: arbitrator,
                    _id: rData[i]._id
                });
                }
               
            }
            return res.status(200).json(arr);
        }).catch(function (err) {
            return res.status(400).json(err);
        });
});

module.exports = router;