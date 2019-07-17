var app = require('express');
var router = app.Router();
var Payment = require('../schemas/paymentCase');
var Login = require('../schemas/login');
var Profile = require('../schemas/profile');
var commonfn = require('../../common');
var VerifyToken = require('../../VerifyToken');
var Involve = require('../schemas/caseinvolve');

router.get("/", function (req, res, next) { 
    return res.status(500).json({
        "status": "error",
        "result": "Bad request"
    });
});
router.get("/Find", VerifyToken, function (req, res, next) {
    Payment.find({ "status": "Active" }, function(err, data) {
        if (data) {
            return res.status(200).json(data);
        }else{
            return res.status(400).json(err);
        }
    }); 
});
router.get("/Findbyid/:caseId", VerifyToken, function(req, res, next) {
    var filter = { $and: [{ "status": "Active" }, { "case_id": req.params.caseId }] };
    Payment.find(filter).sort({_id:-1}).populate('case_id','unique_case_id _id claimant_name respodent_name')
    .populate('partyProfileId' , 'name email')
    .populate('arbitratorProfileid' , 'name email')
    .exec().then(data => {
        return res.status(200).json(data);
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
router.post("/caseId", VerifyToken, function(req, res, next) {
    let filter ={};
    let body = req.body;
    if(body.type == 'Party 1' || body.type == 'Party 2'){
        filter = { $and: [{ "status": "Active" }, { "case_id": body.caseId } ,{ partyProfileId : req.profile_id}] };
    }else{
        filter = { $and: [{ "status": "Active" }, { "case_id": body.caseId } ] };
    }
     console.log(filter);
    Payment.find(filter).sort({_id:-1}).populate('case_id','unique_case_id _id claimant_name respodent_name')
    .populate('partyProfileId' , 'name email')
    .populate('arbitratorProfileid' , 'name email')
    .exec().then(data => {
        return res.status(200).json(data);
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});

router.post("/Create", VerifyToken, function(req, res, next) { 
    let body = req.body ? req.body : '';
    let arrA = [];

    Involve.findOne({case_id : body.case_id}, function (err, cdata) {
        if (!err) {
            if(cdata.scenario=='Scenario 2' || cdata.scenariobyparty2=='Scenario 2'){
                arrA[0] = cdata.scenario3b.p1arbitrator;
                arrA[1] = cdata.scenario3b.p2arbitrator;
                arrA[2] = cdata.scenario3b.commonarbitrator;
            }else{
                arrA[0] = cdata.arbitrator1b2b.arbitrator;     
            }
            let usertype = '';
            if (cdata.party1.p1_loginid == req.profile_id) {
                 usertype = 'Party 1';
            }
             if(cdata.party2.p2_loginid == req.profile_id){
                usertype = 'Party 2';
            }
            let jsondata = {
                partyProfileId : req.profile_id,
                case_id : body.case_id,
                amount :  body.amount,
                usertype : usertype,
                arbitratorProfileid :  arrA,
                transactionId :  'sdsdsdsdsd',
                dateOfpayment : commonfn.Todaydate(),
                note :  body.note,
                createdate : commonfn.Todaydate()
            };

            Payment.create(jsondata, function (err, data) {
                if (data) {
                  return res.status(200).json(data);
                      
                } else {
                    return res.status(400).json(err);
                }
            });
        }else{
            return res.status(400).json({ "error": "server error" });
        } 
    });
});
router.get("/admin/Find", VerifyToken, function (req, res, next) {
    Payment.find({}).sort({_id:-1}).populate('case_id','unique_case_id _id claimant_name respodent_name')
    .populate('partyProfileId' , 'name email')
    .populate('arbitratorProfileid' , 'name email')
    .exec().then(getData => {
        return res.status(200).json(getData);
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
router.get("/arbitrator/Find", VerifyToken, function (req, res, next) {
    const filter =  { arbitratorProfileid : req.profile_id };
    Payment.find(filter).sort({_id:-1}).populate('case_id','unique_case_id _id claimant_name respodent_name')
    .populate('partyProfileId' , 'name email')
    .populate('arbitratorProfileid' , 'name email')
    .exec().then(getData => {
        return res.status(200).json(getData);
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});

router.get("/adminbyId/Find/:caseId", VerifyToken, function (req, res, next) {
    const caseId = req.params.caseId;
    Payment.find({ case_id : caseId }).sort({_id:-1}).populate('case_id','unique_case_id _id claimant_name respodent_name')
    .populate('partyProfileId' , 'name email')
    .populate('arbitratorProfileid' , 'name email')
    .exec().then(getData => {
        return res.status(200).json(getData);
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});

module.exports = router;