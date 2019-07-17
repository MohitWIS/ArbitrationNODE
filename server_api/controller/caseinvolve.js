var app = require('express');
var router = app.Router();
var Login = require('../schemas/login');
var Involve = require('../schemas/caseinvolve');
var Case = require('../schemas/cases');
var Recommend = require('../schemas/recommend');
var Profile = require('../schemas/profile');
var Professional = require('../schemas/professional');
var Fees = require('../schemas/arbitrationfees');
var commonfn = require('../../common');
var VerifyToken = require('../../VerifyToken');
var nodemailer = require('nodemailer');
var multer = require('multer');
let modelCallback = require('./modelCallback');

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
    return res.status(500).json({
        "status": "error",
        "result": "Bad request"
    });
});
router.get("/Find", VerifyToken, function (req, res, next) {
    Involve.find({ "status": "Active" }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json({ "error": "server error" });
        }
    });
});
router.get("/Findbyid", VerifyToken, function (req, res, next) {
    var filter = { $and: [{ "status": "Active" }, { "loginid": req.login_id }] };
    Involve.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
router.put("/select", VerifyToken, function (req, res, next) {
    var body = req.body;
    Involve.findOne({ case_id: body[0].case_id }, function (err, edata) {
        if (!err) {
            var party = {};
            if (edata.party1.p1_loginid == req.profile_id) {
                party = 'Party 1';
            }
            if (edata.party2.p2_loginid == req.profile_id) {
                party = 'Party 2';
            }
            let arrdata = [];
            let chooscenio = edata.scenariobyparty2;
            if (chooscenio == null) {
                chooscenio = edata.scenario;
            }
            for (let i = 0; i < body.length; i++) {
                arrdata.push({
                    case_id: body[i].case_id,
                    partytype: party,
                    ploginid: req.login_id,
                    scenario: chooscenio,
                    fees: body[i].fees,
                    arbitrator_id: body[i].arbitrator_id,
                    arbitrator_loginid: body[i].arbitrator_loginid,
                    createDate: commonfn.Todaydate()
                });
            }
            Recommend.insertMany(arrdata, function (err) {
                if (!err) {
                    if (edata.scenariobyparty2 == 'Scenario 1 B' || edata.scenario == 'Scenario 1 B') {
                        var filterc = { $and: [{ "case_id": body[0].case_id }] };
                        ////console.log(filterc);
                        Recommend.find(filterc, function (err, cdata) {
                            if (!err) {
                                var cparty1 = [];
                                var cparty2 = [];
                                var selected = [];
                                for (let i = 0; i < cdata.length; i++) {
                                    if (cdata[i].partytype == 'Party 2') {
                                        cparty1.push(cdata[i]);
                                    }
                                    if (cdata[i].partytype == 'Party 1') {
                                        cparty2.push(cdata[i]);
                                    }
                                }
                                let k = 0
                                for (let i = 0; i < cparty1.length; i++) {
                                    for (let j = 0; j < cparty2.length; j++) {
                                        if (cparty2[j].arbitrator_id.toString() == cparty1[i].arbitrator_id.toString()) {
                                            ////console.log(cparty2[j].arbitrator_id+"=="+cparty1[i].arbitrator_id);
                                            selected.push(cparty2[j]);
                                        }
                                    }
                                }
                                if (selected.length == 0) {
                                    return res.status(200).json({ 'msg': 'not common' });
                                } else if (selected.length == 1) {
                                    let obja = {
                                        "arbitrator1b2b.arbitrator": selected[0].arbitrator_id,
                                        "arbitrator1b2b.byprofileid": req.profile_id,
                                        "arbitrator1b2b.partytype": selected[0].partytype,
                                        "arbitrator1b2b.add_date": commonfn.Todaydate(),
                                        "casestt": 'ONGOING'
                                    };
                                    Involve.findOneAndUpdate({ case_id: body[0].case_id }, { $set: obja }, { new: true }, function (err, data) {
                                        if (!err) {
                                            Case.findOneAndUpdate({ case_id: body[0].case_id }, { $set: { "casestt": 'ONGOING' } }, { new: true }, function (err, data) {
                                                if (!err) {
                                                    Case.findOneAndUpdate({ _id: body[0].case_id }, { $set: { "casestt": 'ONGOING' } }, function (err) {
                                                        if (!err) {
                                                            let notidata = [{
                                                                profileidby: req.profile_id,
                                                                profileidfor: req.profile_id,
                                                                caseId: body[0].case_id,
                                                                type: 'Activity',
                                                                desc: 'Selected arbitrator for scenario 1 B ',
                                                                createdate: commonfn.Todaydate()
                                                            },
                                                            {
                                                                profileidby: req.profile_id,
                                                                profileidfor: selected[0].arbitrator_id,
                                                                caseId:  body[0].case_id,
                                                                type: 'Notification',
                                                                desc: 'Selected scenario 1 B for case, Please see details.',
                                                                createdate: commonfn.Todaydate()
                                                            }];
                                                            modelCallback.NotiAdd(notidata, function (result) {
                                                                return res.status(200).json({ 'msg': 'Added Successfully!!' });
                                                            });
                                                            
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
                                } else if (selected.length > 1) {

                                    let sortarr = selected.sort(function (a, b) {
                                        return parseFloat(a.fees) - parseFloat(b.fees);
                                    });
                                    let obja = {
                                        "arbitrator1b2b.arbitrator": sortarr[0].arbitrator_id,
                                        "arbitrator1b2b.byprofileid": req.profile_id,
                                        "arbitrator1b2b.partytype": sortarr[0].partytype,
                                        "arbitrator1b2b.add_date": commonfn.Todaydate(),
                                        "casestt": 'ONGOING'
                                    };
                                    Involve.findOneAndUpdate({ case_id: body[0].case_id }, { $set: obja }, { new: true }, function (err) {
                                        if (!err) {
                                            Case.findOneAndUpdate({ case_id: body[0].case_id }, { $set: { "casestt": 'ONGOING' } }, { new: true }, function (err) {
                                                if (!err) {
                                                    Case.findOneAndUpdate({ _id: body[0].case_id }, { $set: { "casestt": 'ONGOING' } }, function (err) {
                                                        if (!err) {
                                                           // return res.status(200).json({ 'msg': 'Added Successfully!!' });
                                                            let notidata = [{
                                                                profileidby: req.profile_id,
                                                                profileidfor: req.profile_id,
                                                                caseId: body[0].case_id,
                                                                type: 'Activity',
                                                                desc: 'Selected arbitrator for scenario 1 B ',
                                                                createdate: commonfn.Todaydate()
                                                            },
                                                            {
                                                                profileidby: req.profile_id,
                                                                profileidfor: sortarr[0].arbitrator_id,
                                                                caseId:  body[0].case_id,
                                                                type: 'Notification',
                                                                desc: 'Selected scenario 1 B for case, Please see details.',
                                                                createdate: commonfn.Todaydate()
                                                            }];
                                                            modelCallback.NotiAdd(notidata, function (result) {
                                                                return res.status(200).json({ 'msg': 'Added Successfully!!' });
                                                            });
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
                                }
                            } else {
                                return res.status(400).json(err);
                            }
                        });
                    } else {
                        return res.status(200).json({ "select": "select" });
                    }
                } else {
                    return res.status(400).json(err);
                }
            });
        } else {
            return res.status(400).json(err);
        }
    });

});
router.post("/recommend_list", VerifyToken, function (req, res, next) {
    let body = req.body;
    let filter = { $and: [{ "case_id": body.caseId }, { "scenario": body.scenario }] };
    //console.log(filter);
    Recommend.find(filter).select('_id case_id partytype ploginid arbitrator_id arbitrator_loginid scenario createDate').then(function (pdata) {
        //console.log(pdata);
        var jobQueries = [];
        req.pdata = pdata;
        pdata.forEach(function (u) {
            jobQueries.push(Professional.findOne({ loginid: u.arbitrator_loginid }).select('_id loginid description functional_area_arbitration'));
        });
        Promise.all(jobQueries).then(function (professional) {
            var feesarr = [];
            req.pdata.forEach(function (u) {
                feesarr.push(Fees.findOne({ loginid: u.arbitrator_loginid }).select('_id loginid arbitration_fee'));
            });
            Promise.all(feesarr).then(function (feesarr) {
                var uprofile = [];
                req.pdata.forEach(function (u) {
                    uprofile.push(Profile.findOne({ loginid: u.arbitrator_loginid }).select('_id loginid name city usertype gender profileImg createDate'));
                });
                Promise.all(uprofile).then(function (arrprofile) {
                    var result = [];
                    for (var i = 0; i < req.pdata.length; i++) {
                        result.push({
                            "_id": req.pdata[i]._id,
                            "partytype": req.pdata[i].partytype,
                            "profile": arrprofile[i],
                            "professional": professional[i],
                            "fees": feesarr[i],
                        });
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
});
router.put("/appoint", VerifyToken, function (req, res, next) {
    var body = req.body;
    ////console.log(body); return false;
    Involve.findOne({ case_id: body.case_id }, function (err, edata) {
        if (!err) {
            var party = {};
            if (edata.party1.p1_loginid == req.profile_id) {
                party = 'Party 1';
            }
            if (edata.party2.p2_loginid == req.profile_id) {
                party = 'Party 2';
            }
            var jsondata = {
                'arbitrator1b2b.arbitrator': body.arbitrator_id,
                'arbitrator1b2b.partytype': party,
                'arbitrator1b2b.byprofileid': req.profile_id,
                'arbitrator1b2b.add_date': commonfn.Todaydate(),
                'casestt': 'ONGOING'
            };
            ////console.log(jsondata);
            ////console.log(body);
            Involve.findOneAndUpdate({ case_id: body.case_id }, jsondata, function (err) {
                if (!err) {
                    Case.findOneAndUpdate({ _id: body.case_id }, { $set: { "casestt": 'ONGOING' } }, function (err) {
                        if (!err) {
                            return res.status(200).json({ 'msg': 'Added Successfully!!' });
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
router.put("/accept", VerifyToken, function (req, res, next) {
    let body = req.body;
    Involve.findOne({ case_id: body.case_id }, function (err, edata) {
        if (!err) {
            let json = {
                'scenario3b.acceptstt': 'Complete',
                'scenario3b.acceptDate': commonfn.Todaydate(),
                'scenario3b.acceptby': req.profile_id,
                'casestt': 'ONGOING'

            }
            Case.findOneAndUpdate({ _id: body.case_id }, { $set: { "casestt": 'ONGOING' } }, function (err , data) {
                if (!err) {
                    Involve.findOneAndUpdate({ case_id: body.case_id }, json, function (err) {
                        if (!err) {
                            let notidata = [{
                                profileidby: req.profile_id,
                                profileidfor: req.profile_id,
                                caseId: body.case_id,
                                type: 'Activity',
                                desc: 'Selected third arbitrator for scenario 2',
                                createdate: commonfn.Todaydate()
                            }, {
                                profileidby: req.profile_id,
                                profileidfor: body.arbitrator_id,
                                caseId: body.case_id,
                                type: 'Notification',
                                desc: 'Selected scenario 2 for case',
                                createdate: commonfn.Todaydate()
                            }];
                            modelCallback.NotiAdd(notidata, function (result) {
                                return res.status(200).json('Select Successfully!!');
                            });
                        } else {
                            return res.status(400).json(err);
                        }
                    });
                } else {
                    return res.status(400).json(err);
                }
            });

        } else {
            return res.status(400).json({ "duplicate": "already selected" });
        }
    });
});
router.put("/cancel", VerifyToken, function (req, res, next) {
    let body = req.body;
    Involve.findOne({ case_id: body.case_id }, function (err, edata) {
        if (!err) {
            let json = {
                'scenario3b.commonarbitrator' : null,
                'scenario3b.chooseDate': null,
                'scenario3b.chooseby': null,
            }
                    Involve.findOneAndUpdate({ case_id: body.case_id }, json, function (err) {
                        if (!err) {
                            let notidata = [{
                                profileidby: req.profile_id,
                                profileidfor: req.profile_id,
                                caseId: body.case_id,
                                type: 'Activity',
                                desc: 'Rejected third arbitrator for scenario 2',
                                createdate: commonfn.Todaydate()
                            }, {
                                profileidby: req.profile_id,
                                profileidfor: body.arbitrator_id,
                                caseId: body.case_id,
                                type: 'Notification',
                                desc: 'Rejected third arbitrator for scenario 2',
                                createdate: commonfn.Todaydate()
                            }];
                            modelCallback.NotiAdd(notidata, function (result) {
                                return res.status(200).json('Reject Successfully!!');
                            });
                        } else {
                            return res.status(400).json(err);
                        }
                    });
               

        } else {
            return res.status(400).json({ "duplicate": "already selected" });
        }
    });
})
router.put("/scenario2/appoint", VerifyToken, function (req, res, next) {
    var body = req.body;
    if (req.usertype == 'party') {
        Involve.findOne({ case_id: body.case_id }, function (err, edata) {
            if (!err) {
                let json = {};
                if (edata.party1.p1_loginid == req.profile_id) {
                    json = {
                        'scenario3b.p1arbitrator': body.arbitrator_id,
                        'scenario3b.p1arbitratorDate': commonfn.Todaydate()
                    }
                    //'setfreehour.$.available_location'
                }
                if (edata.party2.p2_loginid == req.profile_id) {
                    json = {
                        'scenario3b.p2arbitrator': body.arbitrator_id,
                        'scenario3b.p2arbitratorDate': commonfn.Todaydate()
                    }
                }
                Involve.findOneAndUpdate({ case_id: body.case_id }, json, function (err) {
                    if (!err) {
                        let notidata = [{
                            profileidby: req.profile_id,
                            profileidfor: req.profile_id,
                            caseId: body.case_id,
                            type: 'Activity',
                            desc: 'Selected arbitrator for scenario 2',
                            createdate: commonfn.Todaydate()
                        },
                        {
                            profileidby: req.profile_id,
                            profileidfor: body.arbitrator_id,
                            caseId: body.case_id,
                            type: 'Notification',
                            desc: 'Selected scenario 2 for case, Please select further arbitrator.',
                            createdate: commonfn.Todaydate()
                        }];
                        modelCallback.NotiAdd(notidata, function (result) {
                            return res.status(200).json('Select Successfully!!');
                        });
                    } else {
                        return res.status(400).json(err);
                    }
                });
            } else {
                return res.status(400).json(err);
            }
        });
    } else {
        Involve.findOne({ case_id: body.case_id }, function (err, edata) {
            if (!err) {
                let json = {};

                if (edata.scenario3b.commonarbitrator == null) {
                    json = {
                        'scenario3b.commonarbitrator': body.arbitrator_id,
                        'scenario3b.chooseDate': commonfn.Todaydate(),
                        'scenario3b.chooseby': req.profile_id,

                    }
                    Involve.findOneAndUpdate({ case_id: body.case_id }, json, function (err) {
                        if (!err) {
                            let notidata = [{
                                profileidby: req.profile_id,
                                profileidfor: req.profile_id,
                                caseId: body.case_id,
                                type: 'Activity',
                                desc: 'Selected third arbitrator for case scenario 2 ',
                                createdate: commonfn.Todaydate()
                            }];
                            modelCallback.NotiAdd(notidata, function (result) {
                                return res.status(200).json('Select Successfully!!');
                            });
                        } else {
                            return res.status(400).json(err);
                        }
                    });
                } else {
                    return res.status(400).json({ "duplicate": "already selected" });
                }

            } else {
                return res.status(400).json(err);
            }
        });
    }
});
router.put("/Create/hearing", VerifyToken, function (req, res, next) {
    var body = req.body;
    Involve.findOneAndUpdate({ case_id: body.case_id }, { $push: { hearing_details: body } }, { new: true }, function (err, data) {
        if (!err) {
            let notidata = [{
                profileidby: req.profile_id,
                profileidfor: req.profile_id,
                caseId: body.case_id,
                type: 'Activity',
                desc: 'Created next Hearing date ' + dateFormat(body.hearing_date,'YYYY-MM-DD HH:mm:a') + ' for case',
                createdate: commonfn.Todaydate()
            }];
            if (data.scenario == 'Scenario 2' || data.scenariobyparty2 == 'Scenario 2') {
                if (data.scenario3b.p1arbitrator != req.profile_id) {
                    notidata.push({
                        profileidby: req.profile_id,
                        profileidfor: data.scenario3b.p1arbitrator,
                        caseId: body.case_id,
                        type: 'Notification',
                        desc: 'Arbitrator created next Hearing date ' +  dateFormat(body.hearing_date,'YYYY-MM-DD HH:mm:a') + ' for case',
                        createdate: commonfn.Todaydate()
                    });
                } else if (data.scenario3b.p1arbitrator != req.profile_id) {
                    notidata.push({
                        profileidby: req.profile_id,
                        profileidfor: data.scenario3b.p2arbitrator,
                        caseId: body.case_id,
                        type: 'Notification',
                        desc: 'Arbitrator created next Hearing date ' +  dateFormat(body.hearing_date,'YYYY-MM-DD HH:mm:a') + ' for case',
                        createdate: commonfn.Todaydate()
                    });
                } else if (data.scenario3b.commonarbitrator != req.profile_id) {
                    notidata.push({
                        profileidby: req.profile_id,
                        profileidfor: data.scenario3b.commonarbitrator,
                        caseId: body.case_id,
                        type: 'Notification',
                        desc: 'Arbitrator created next Hearing date ' +  dateFormat(body.hearing_date,'YYYY-MM-DD HH:mm:a') + ' for case',
                        createdate: commonfn.Todaydate()
                    })
                }
            } else {
                notidata.push({
                    profileidby: req.profile_id,
                    profileidfor: data.arbitrator1b2b.arbitrator,
                    caseId: body.case_id,
                    type: 'Notification',
                    desc: 'Arbitrator created next Hearing date ' + body.hearing_date + ' for case',
                    createdate: commonfn.Todaydate()
                });
            }
            modelCallback.NotiAdd(notidata, function (result) {
                return res.status(200).json(data);
            });
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/Create/award", VerifyToken, function (req, res, next) {
    var body = req.body;
    //return false;
    var objdata = {
        awardSummary: body.awardSummary,
        winingParty: body.winingParty,
        winingPartyType: body.winingPartyType,
        awardDocumets: body.awardDocumets,
        otherDocumets: body.otherDocumets,
        awardDate: commonfn.Todaydate(),
        givenby: req.profile_id
    }
    
    // return false;
    Involve.findOneAndUpdate({ case_id: body.case_id } ,{ awardDetails: objdata  , casestt: 'COMPLETED'}, { new: true }, function (err, data) {
        console.log("sdsd");
        if (!err) {
            
            Case.findOneAndUpdate({ _id: body.case_id }, { $set: { casestt: 'COMPLETED' } }, function (err) {
                if (!err) {
                    // return res.status(200).json(data);
                    let notidata = [{
                        profileidby: req.profile_id,
                        profileidfor: req.profile_id,
                        caseId: body.case_id,
                        type: 'Activity',
                        desc: 'Award given to ' + body.winingPartyType,
                        createdate: commonfn.Todaydate()
                    }];
                    if (data.scenario == 'Scenario 2' || data.scenariobyparty2 == 'Scenario 2') {

                        if (data.scenario3b.p1arbitrator != req.profile_id) {
                            notidata.push({
                                profileidby: req.profile_id,
                                profileidfor: data.scenario3b.p1arbitrator,
                                caseId: body.case_id,
                                type: 'Notification',
                                desc: 'Arbitrator Award given to ' + body.winingPartyType + ' by the Arbitrator',
                                createdate: commonfn.Todaydate()
                            });
                        }
                        if (data.scenario3b.p2arbitrator != req.profile_id) {
                            notidata.push({
                                profileidby: req.profile_id,
                                profileidfor: data.scenario3b.p2arbitrator,
                                caseId: body.case_id,
                                type: 'Notification',
                                desc: 'Arbitrator Award given to ' + body.winingPartyType + ' by the Arbitrator',
                                createdate: commonfn.Todaydate()
                            });
                        }
                        if (data.scenario3b.commonarbitrator != req.profile_id) {
                            notidata.push({
                                profileidby: req.profile_id,
                                profileidfor: data.scenario3b.commonarbitrator,
                                caseId: body.case_id,
                                type: 'Notification',
                                desc: 'Arbitrator Award given to ' + body.winingPartyType + ' by the Arbitrator',
                                createdate: commonfn.Todaydate()
                            })
                        }

                    } else {
                        notidata.push({
                            profileidby: req.profile_id,
                            profileidfor: data.arbitrator1b2b.arbitrator,
                            caseId: body.case_id,
                            type: 'Notification',
                            desc: 'Arbitrator Award given to ' + body.winingPartyType + ' by the Arbitrator',
                            createdate: commonfn.Todaydate()
                        });
                    }

                    modelCallback.NotiAdd(notidata, function (result) {
                        return res.status(200).json(data);
                    });

                } else {
                    return res.status(400).json(err);
                }
            });
        } else {

            console.log(err);
            return res.status(400).json(err);
        }
    });
});

router.put("/Create/Fees", VerifyToken, function (req, res, next) {
    var body = req.body;
    //return false;
    var objdata = {
        party1fees: body.party1fees,
        party2fees: body.party2fees,
        arbitrationfees: body.arbitrationfees,
        feesDate: commonfn.Todaydate()
    }
    // return false;
    Involve.findOneAndUpdate({ case_id: body.case_id } ,{ feesdetails1A1B: objdata}, { new: true }, function (err, data) {
        if (!err) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});

router.post("/Upload", VerifyToken, function (req, res, next) {
    var currUpload = setupload_dir('caseDocumets');
    currUpload(req, res, function (err) {
        if (err) {
            return res.status(400).json(err);
        } else {

            var data = {
                "originalname": req.files[0].originalname,
                "filename": req.files[0].filename,
                "size": req.files[0].size
            };
            return res.status(200).json(data);
        }
    });
});
router.post("/Upload/award", VerifyToken, function (req, res, next) {
    var currUpload = setupload_dir('awardDocuments');
    currUpload(req, res, function (err) {
        if (err) {
            return res.status(400).json(err);
        } else {
            var data = {
                "originalname": req.files[0].originalname,
                "filename": req.files[0].filename,
                "size": req.files[0].size
            };
            return res.status(200).json(data);
        }
    });
});
router.put("/recommendation/Remove", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var filter = { "_id": body.recommend_id };

    Recommend.findByIdAndRemove(filter, function (err) {
        if (!err) {
            return res.status(200).json({ "result": "Recommended Arbitration Removed Successfully!!" });
        } else {
            return res.status(200).json(err);
        }
    });
});
router.put("/nexthearingDate", VerifyToken, function (req, res, next) {
    let body = req.body;
    const json = {
        nexthearingDate : body.nexthearingDate
    };
    console.log(body);
    Involve.findOneAndUpdate({ case_id: body.case_id }, json, function (err ,data) {
        if (!err) {
            let notidata = [{
                profileidby: req.profile_id,
                profileidfor: req.profile_id,
                caseId: body.case_id,
                type: 'Activity',
                desc: 'Created Next hearing date for case',
                createdate: commonfn.Todaydate()
            }, {
                profileidby: req.profile_id,
                profileidfor: body.arbitrator_id,
                caseId: body.case_id,
                type: 'Notification',
                desc: 'You selected for scenario 2 case',
                createdate: commonfn.Todaydate()
            }];
            if(data.arbitrator1b2b.arbitrator!=null){
                notidata.push({
                    profileidby: req.profile_id,
                    profileidfor: data.arbitrator1b2b.arbitrator,
                    caseId: body.case_id,
                    type: 'Notification',
                    desc: 'You selected for scenario 2 case',
                    createdate: commonfn.Todaydate()
                });
            }
            if(data.scenario3b.p1arbitrator!=null){
                notidata.push({
                    profileidby: req.profile_id,
                    profileidfor: data.scenario3b.p1arbitrator,
                    caseId: body.case_id,
                    type: 'Notification',
                    desc: 'You selected for scenario 2 case',
                    createdate: commonfn.Todaydate()
                });
                notidata.push({
                    profileidby: req.profile_id,
                    profileidfor: data.scenario3b.p2arbitrator,
                    caseId: body.case_id,
                    type: 'Notification',
                    desc: 'You selected for scenario 2 case',
                    createdate: commonfn.Todaydate()
                });
                notidata.push({
                    profileidby: req.profile_id,
                    profileidfor: data.scenario3b.commonarbitrator,
                    caseId: body.case_id,
                    type: 'Notification',
                    desc: 'You selected for scenario 2 case',
                    createdate: commonfn.Todaydate()
                });
            }
            modelCallback.NotiAdd(notidata, function (result) {
                return res.status(200).json('Next Hearing Date selected Successfully!!');
            });
        } else {
            return res.status(400).json(err);
        }
    });
});

module.exports = router;