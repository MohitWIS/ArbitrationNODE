var app = require('express');
var router = app.Router();
var Login = require('../schemas/login');
var Profile = require('../schemas/profile');
var Fees = require('../schemas/arbitrationfees');
var Case = require('../schemas/cases');
var Involve = require('../schemas/caseinvolve');
var Short = require('../schemas/sortlist');
var commonfn = require('../../common');
var VerifyToken = require('../../VerifyToken');
var nodemailer = require('nodemailer');
var multer = require('multer');
let modelCallback = require('./modelCallback');
const docx = require("docx");
const fs = require('fs');
const { Document, Paragraph, Packer } = docx;
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
    return res.status(500).json({
        "status": "error",
        "result": "Bad request"
    });
});
router.get("/Find/Notice", VerifyToken, function (req, res, next) {
    var filter = { $and: [{ casestt: 'UNDERDISCUSSION' }, { loginid: req.login_id }] };
    Case.find(filter).sort({createDate : -1}).exec().then(function (data) {
            return res.status(200).json(data);
      
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
router.get("/Find", VerifyToken, function (req, res, next) {
    if (req.usertype == 'arbitrator') {
        var filter = {
            $or: [
                { 'arbitrator1b2b.arbitrator': req.profile_id },
                { 'scenario3b.p1arbitrator': req.profile_id },
                { 'scenario3b.p2arbitrator': req.profile_id },
                { 'scenario3b.commonarbitrator': req.profile_id }
            ]
        };
        Involve.find(filter).populate('case_id', '_id claimant_name unique_case_id case_type respodent_name case_description fromaddress casestt nexthearingDate fromemaildetail')
            .populate('party1.p1_loginid', 'name city address profileImg _id')
            .populate('party2.p2_loginid', 'name city address profileImg _id')
            .populate('arbitrator1b2b.arbitrator', 'name city address profileImg _id')
            .exec().then(involvedata => {
                var loginstt = '';
                return res.status(200).json(involvedata);
            }).catch(function (err) {
                return res.status(400).json(err);
            });
    } else if (req.usertype == 'party') {
        var filter = {
            $or: [
                { 'party1.p1_loginid': req.profile_id },
                { 'party2.p2_loginid': req.profile_id },
            ]
        };
        Involve.find(filter).populate('case_id', '_id claim_amount claimant_name unique_case_id case_type respodent_name case_description fromaddress casestt')
            .populate('party1.p1_loginid', 'name city address profileImg _id')
            .populate('party2.p2_loginid', 'name city address profileImg _id')
            .populate('arbitrator1b2b.arbitrator', 'name city address profileImg _id')
            .exec().then(involvedata => {
                return res.status(200).json(involvedata);
                }).catch(function (err) {
                //console.log(err);
                return res.status(400).json(err);
            });
    } else {
        Case.find({}, function (err, data) {
            if (data) {
                return res.status(200).json(data);
            } else {
                return res.status(400).json({ "error": "server error" });
            }
        });
    }
});
router.get("/ShortFind/:profileId", VerifyToken, function (req, res, next) {
    //console.log(req.params.profileId);
    const filter  =  { $and : [ {arbitrator_id : req.params.profileId} , { profileId : req.profile_id}]};
    console.log(filter);
    Short.find(filter).exec().then(sdata => {
        let arrc = [];
        sdata.forEach(res => {
            arrc.push(res.case_id);
         });
         console.log(arrc);
         const filter2  =  { $and : [ { case_id : {'$nin': arrc}} ,{ 'arbitrator1b2b.arbitrator' : null } , { 'scenario3b.commonarbitrator' : null } ,{ $or :[{ 'party1.p1_loginid' : req.profile_id} , { 'party2.p2_loginid' : req.profile_id}]} ]};
        Involve.find(filter2).populate('case_id', '_id claim_amount claimant_name unique_case_id case_type respodent_name case_description fromaddress casestt')
        .populate('party1.p1_loginid', 'name city address profileImg _id')
        .populate('party2.p2_loginid', 'name city address profileImg _id')
        .populate('arbitrator1b2b.arbitrator', 'name city address profileImg _id')
        .exec().then(involvedata => {
            return res.status(200).json(involvedata);
            }).catch(function (err) {
            //console.log(err);
            return res.status(400).json(err);
        });
         
    }).catch(function (err) {
        console.log(err);
        return res.status(400).json(err);
    });
});
router.get("/Findbyid/:case_id", VerifyToken, function (req, res, next) {
    var filter = { $and: [{ "_id": req.params.case_id }] };
    Case.findOne(filter, function (err, data) {
        if (!err) {
            Involve.findOne({ 'case_id': req.params.case_id }).sort({ 'hearing_details.hearing_date': -1 })
                .populate('party1.p1_loginid', 'name city address profileImg')
                .populate('party2.p2_loginid', 'name city address profileImg')
                .populate('arbitrator1b2b.arbitrator', 'name city address profileImg loginid')
                .populate('scenario3b.p1arbitrator', 'name city address profileImg _id')
                .populate('scenario3b.p2arbitrator', 'name city address profileImg _id')
                .populate('scenario3b.commonarbitrator', 'name city address profileImg _id')
                .exec().then(involvedata => {
                    let joinstt = "";
                    if (req.usertype == 'party') {
                        var loginstt = "";

                        if (involvedata.party1.p1_loginid._id == req.profile_id) {
                            loginstt = 'Party 1';
                            //console.log("dfdfd");
                        } else {
                            loginstt = 'Party 2';
                        }
                    } else {
                        loginstt = 'arbitrator';
                        if (involvedata.scenario3b.chooseby != null && involvedata.scenario3b.acceptstt == 'Pending') {
                            joinstt = involvedata.scenario3b.chooseby == req.profile_id ? 'not' : 'join';
                        } else {
                            joinstt = 'done';
                        }
                    }
                    let astt = '';
                    if (involvedata.scenario == 'Scenario 2' || involvedata.scenariobyparty2 == 'Scenario 2') {
                        if(involvedata.scenario3b.p1arbitrator == req.profile_id){
                            astt = 'arbitrator1';
                        }else if(involvedata.scenario3b.p2arbitrator == req.profile_id){
                            astt = 'arbitrator1';
                        }else{
                            astt = 'arbitrator3';
                        }
                    }
                    if (involvedata.arbitrator1b2b.arbitrator != null) {
                        let filterfees = { "loginid": involvedata.arbitrator1b2b.arbitrator.loginid };
                        Fees.findOne(filterfees).select('_id loginid arbitration_fee').exec().then(fdata => {
                            return res.status(200).json({
                                'casedata': data,
                                'involve': involvedata,
                                'loginstt': loginstt,
                                'joinstt': joinstt,
                                "arbitration_fee": [fdata != null ? fdata.arbitration_fee : 0]
                            });

                        }).catch(function (err) {
                            return res.status(400).json(err);
                        });
                    } else if (involvedata.scenario == 'Scenario 2' || involvedata.scenariobyparty2 == 'Scenario 2') {
                        if (involvedata.scenario3b.commonarbitrator != null && involvedata.scenario3b.acceptstt == 'Complete') {
                            let cjson = {
                                $or: [{ "_id": involvedata.scenario3b.p1arbitrator },
                                { "_id": involvedata.scenario3b.p2arbitrator },
                                { "_id": involvedata.scenario3b.commonarbitrator }
                                ]
                            };
                            

                            Profile.find(cjson).select('loginid').exec().then(function (cdata) {
                                let fjson = {
                                    $or: [{ "loginid": cdata != null ? cdata[0].loginid : null },
                                    { "loginid": cdata != null ? cdata[1].loginid : null },
                                    { "loginid": cdata != null ? cdata[2].loginid : null }
                                    ]
                                };
                                Fees.find(fjson).select('arbitration_fee').exec().then(function (fdata) {
                                    return res.status(200).json({
                                        'casedata': data,
                                        'involve': involvedata,
                                        'loginstt': loginstt,
                                        'joinstt': joinstt,
                                        'arbitratorType' : astt,
                                        "arbitration_fee": [fdata != null ? fdata[0].arbitration_fee : 0,
                                        fdata != null ? fdata[1].arbitration_fee : 0,
                                        fdata != null ? fdata[2].arbitration_fee : 0]
                                    });

                                }).catch(function (err) {
                                    return res.status(400).json(err);
                                });
                            }).catch(function (err) {
                                return res.status(400).json(err);
                            });
                        } else {
                            return res.status(200).json({
                                'casedata': data,
                                'involve': involvedata,
                                'loginstt': loginstt,
                                'joinstt': joinstt,
                                "arbitration_fee": [0]
                            });
                        }
                    } else {
                        return res.status(200).json({
                            'casedata': data,
                            'involve': involvedata,
                            'loginstt': loginstt,
                            'joinstt': joinstt,
                            "arbitration_fee": [0]
                        });
                    }

                }).catch(function (err) {
                    return res.status(400).json(err);
                });
        } else {
            return res.status(400).json({ "error": "server error" });
        }
    });
});
router.get("/party/list", VerifyToken, function (req, res, next) {
    var filter = { $and: [{ "loginid": req.login_id }] };
    Case.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
router.post("/Create", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var Todaydate = commonfn.Todaydate();
    var jsondata = {
        loginid: req.login_id,
        unique_case_id: commonfn.uniqueNo2(body.claimant_name),
        createDate: Todaydate,
        claimant_name: body ? body.claimant_name : '',
        case_type: body ? body.case_type : '',
        claim_amount: body ? body.claim_amount : '',
        respodent_name: body ? body.respodent_name : '',
        notknow_claim_amount: body ? body.notknow_claim_amount : '',
        agreement: body ? body.agreement : '',
        case_description: body ? body.case_description : '',
        file: body ? body.file : '',
        size: body ? body.size : '',
        originalFile: body ? body.originalFile : '',
        scenario: body ? body.scenario : '',
        fromemaildetail: body ? body.fromemaildetail : '',
        toemaildetail: body ? body.toemaildetail : '',
    };
    // fromaddress: body ? body.fromaddress : '',
    // fromemail: body ? body.fromemail : '',
    // from_reference: body ? body.from_reference : '',
    // toemaildetail: body ? body.toemaildetail : '',
    Case.create(jsondata, function (err, data) {
        if (!err) {
            var involvejson = {
                case_id: data._id,
                party1: {
                    "p1_loginid": req.profile_id,
                    "add_date": Todaydate,
                },
                "scenario": body.scenario,
                "createDate": Todaydate
            };
            Involve.create(involvejson, function (err, edata) {
                if (!err) {
                    let notidata = [{
                        profileidby: req.profile_id,
                        profileidfor: req.profile_id,
                        caseId: data._id,
                        type: 'Activity',
                        desc: 'Created Case ' + data.claimant_name + ' vs ' + data.respodent_name,
                        createdate: commonfn.Todaydate()
                    }];
                    modelCallback.NotiAdd(notidata, function (result) {
                        return res.status(200).json(data);
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
router.put("/Update", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        updateDate: commonfn.Todaydate(),
        claimant_name: body ? body.claimant_name : '',
        case_type: body ? body.case_type : '',
        claim_amount: body ? body.claim_amount : '',
        respodent_name: body ? body.respodent_name : '',
        notknow_claim_amount: body ? body.notknow_claim_amount : '',
        agreement: body ? body.agreement : '',
        case_description: body ? body.case_description : '',
        fromaddress: body ? body.fromaddress : '',
        fromemail: body ? body.fromemail : '',
        from_reference: body ? body.from_reference : '',
        toemaildetail: body ? body.toemaildetail : '',
        tofromemaildetail: body ? body.fromemaildetail : '',
    };
    if (body.file) {
        jsondata.file = body ? body.file : '';
        jsondata.size = body ? body.size : '';
        jsondata.originalFile = body ? body.originalFile : '';
    }
    Case.findOneAndUpdate({ _id: body.case_id }, jsondata, { new: true }, function (err, data) {
        if (!err) {
            let notidata = [{
                profileidby: req.profile_id,
                profileidfor: req.profile_id,
                caseId: data._id,
                type: 'Activity',
                desc: 'You Updated case on ' + data.respodent_name,
                createdate: commonfn.Todaydate()
            }];
            modelCallback.NotiAdd(notidata, function (result) {
                return res.status(200).json(data);
            });
        } else {
            console.log(err);
            return res.status(400).json(err);
        }
    });
});
router.put("/counterClaim/Update", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        CounterClaimAmount: body ? body.CounterClaimAmount : '',
        notknowCounterClaimAmount: body ? body.notknowCounterClaimAmount : '',
        CounterDescription: body ? body.CounterDescription : '',
        CounterClaimby: body ? req.profile_id : '',
        CounterClaimstt: body ? true : false ,
        Countertoemaildetail : body ? body.Countertoemaildetail : [],
        Counterfromemaildetail : body ? body.Counterfromemaildetail : [],
        counterNoticestt : false
    };
    console.log(body);
    Case.findOneAndUpdate({ _id: body.caseId }, jsondata, { new: true }, function (err, data) {
        if (!err) {
            let notidata = [{
                profileidby: req.profile_id,
                profileidfor: req.profile_id,
                caseId: data._id,
                type: 'Activity',
                desc: 'Created counter claim a' +data.claimant_name+ ' vs '+ data.respodent_name,
                createdate: commonfn.Todaydate()
            }];
            modelCallback.NotiAdd(notidata, function (result) {
                return res.status(200).json(data);
            });
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/scenario/Update", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        scenario: body ? body.scenario : '',
    };
    Case.findOneAndUpdate({ _id: body.case_id }, jsondata, { new: true }, function (err, data) {
        if (!err) {
            Involve.findOneAndUpdate({ case_id: body.case_id }, jsondata, { new: true }, function (err) {
                if (!err) {
                    let notidata = [{
                        profileidby: req.profile_id,
                        profileidfor: req.profile_id,
                        caseId: data._id,
                        type: 'Activity',
                        desc: 'Created case on ' + data.respodent_name + ' select Scenario ' + body.scenario,
                        createdate: commonfn.Todaydate()
                    }];
                    modelCallback.NotiAdd(notidata, function (result) {
                        return res.status(200).json(data);
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
router.put("/scenarioparty2/Update", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        'scenariobyparty2': body ? body.scenario : '',
        'party2.p2_loginid': req.profile_id,
        'party2.joinstt': 'Joined',
        'party2.add_date': commonfn.Todaydate()
    };
    Involve.findOneAndUpdate({ case_id: body.case_id }, jsondata, { new: true }, function (err, data) {
        if (!err) {
            let notidata = [{
                profileidby: req.profile_id,
                profileidfor: req.profile_id,
                caseId: data.case_id,
                type: 'Activity',
                desc: 'You selected Scenario ' + body.scenario,
                createdate: commonfn.Todaydate()
            },
            {
                profileidby: req.profile_id,
                profileidfor: data.party1.p1_loginid,
                caseId: data.case_id,
                type: 'Notification',
                desc: 'Selected Scenario ' + body.scenario,
                createdate: commonfn.Todaydate()
            }];
            modelCallback.NotiAdd(notidata, function (result) {
                return res.status(200).json(data);
            });
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/change/status", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        status: body ? body.status : '',
    };
    Case.findOneAndUpdate({ _id: body.case_id }, jsondata, { new: true }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.post("/Remove", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var filter = { "_id": body.case_id };
    Case.findByIdAndRemove(filter, function (err) {
        if (!err) {
            Involve.findOneAndRemove({ case_id: body.case_id }, function (err) {
                if (!err) {
                    return res.status(200).json({ "result": "Case Removed Successfully!!" });
                } else {
                    return res.status(200).json(err);
                }
            });
        } else {
            return res.status(200).json(err);
        }
    });
});
router.post("/Push", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        Address: body ? body.address : '',
        Email: body ? body.email : '',
        document_date: body ? body.document_date : ''
    };
    Case.findOneAndUpdate({ loginid: req.case_id }, { $push: { toemaildetail: jsondata } }, { new: true }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/sub/Update", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        'toemaildetail.$.universitycollege': body ? body.Address : '',
        'toemaildetail.$.field_of_study': body ? body.email : '',
        'toemaildetail.$.degree': body ? body.document_date : '',
    };
    Case.findOneAndUpdate({ 'toemaildetail._id': body.id }, { $set: jsondata }, { new: true }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.post("/Upload", VerifyToken, function (req, res, next) {
    var currUpload = setupload_dir('party');
    currUpload(req, res, function (err) {
        if (err) {
            return res.status(400).json(err);
        } else {
            var data = {
                "originalname": req.files[0].originalname,
                "filename": req.files[0].filename,
                "size": req.files[0].size,

            };
            return res.status(200).json(data);
        }
    });
});
function sendmail(data) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'edisputecontact@gmail.com',
            pass: 'edispute123'
        }
    });
    var temp = commonfn.casetemp();
    var mapObj = {
        '@name': data.respodent_name,
        '@joinurl': commonfn.baseURL2() + 'app/login?caseidsrediract=' + data._id,
        '@casetype': data.case_type,
        '@description': data.case_description
    };
    temp = temp.replace(/@name|@joinurl|@casetype|@description/gi, function (matched) {
        return mapObj[matched];
    });
    var maillist = [];
    var list = data.toemaildetail;
    for (let i = 0; i < list.length; i++) {
        maillist.push(list[i].toemail);
    }
    var mailOptions = {
        from: 'edisputecontact@gmail.com',
        to: maillist,
        subject: 'Case File',
        html: temp
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            //console.log(error);
        } else {
            //console.log('Email sent: ' + info.response);
        }
    });
}
router.post("/party2/Find", VerifyToken, function (req, res, next) {
    let body = req.body;
    let filter = { $and: [{ case_id: body.caseId }, { $or: [{ 'party1.p1_loginid': req.profile_id }, { 'party2.p2_loginid': req.profile_id }] }] }
    
    Involve.findOne({ case_id: body.caseId }).exec().then(involve => {
        
      if (involve != null && involve.party2.joinstt == 'Pending') {
        Involve.countDocuments(filter, function (err, data) {
            if (!err) {
                if (data == 0) {
                    console.log('join');
                    Case.findOne({ _id: body.caseId }, function (err, cdata) {
                        if (!err) {
                            return res.status(200).json(cdata);
                        } else {
                            return res.status(400).json(err);
                        }
                    });
                } else {
                    return res.status(400).json(data);
                }
            } else {
                return res.status(400).json(err);
            }
        });
          
      }else{
       // console.log('not');
        return res.status(400).json({error : 'not found'});
      }

    }).catch(function(err){
       return res.status(400).json(err);
    })



   
});
router.get("/Find/Admin", function (req, res) {
    Involve.find({}).sort({createDate : -1}).populate('case_id')
        .populate('party1.p1_loginid', 'name city address profileImg _id')
        .populate('party2.p2_loginid', 'name city address profileImg _id')
        .populate('arbitrator1b2b.arbitrator', 'name city address profileImg _id')
        .exec().then(involvedata => {
            var loginstt = "";
            return res.status(200).json(involvedata);
        }).catch(function (err) {
            return res.status(400).json(err);
        });
});
router.get("/document/Create/:caseId", function (req, res) {
    Case.findOne({ _id: req.params.caseId }).exec().then(casedata => {
        const doc = new Document({
            creator: "Clippy",
            title: "Notice Case",
            description: "A brief example of using docx",
        });
        doc.Styles.createParagraphStyle("Heading1", "Heading 1")
            .basedOn("Normal")
            .next("Normal")
            .quickFormat()
            .size(28)
            .bold()
            .italics()
            .spacing({ after: 120 });
        doc.Styles.createParagraphStyle("Heading2", "Heading 2")
            .basedOn("Normal")
            .next("Normal")
            .quickFormat()
            .size(25)
            .bold()
            .spacing({ before: 240, after: 120 });
        doc.Styles.createParagraphStyle("Heading3", "Heading 3")
        .basedOn("Normal")
        .next("Normal")
        .quickFormat()
        .size(15)
        .bold()
        .spacing({ before: 240, after: 120 });

        doc.Styles.createParagraphStyle("aside", "Aside")
            .basedOn("Normal")
            .next("Normal")
            .color("999999")
            .italics()
            .indent({ left: 720 })
            .spacing({ line: 276 });

        doc.Styles.createParagraphStyle("wellSpaced", "Well Spaced")
            .basedOn("Normal")
            .spacing({ line: 276, before: 20 * 72 * 0.1, after: 20 * 72 * 0.05 });

        doc.Styles.createParagraphStyle("ListParagraph", "List Paragraph")
            .quickFormat()
            .basedOn("Normal");
            
        const numberedAbstract = doc.Numbering.createAbstractNumbering();
        numberedAbstract.createLevel(0, "lowerLetter", "%1)", "left");

        doc.createParagraph("Case Notice").heading1();
        doc.createParagraph('Date :'+commonfn.Todaydate()).heading2();
        doc.createParagraph('Ref No : Case id: ' + casedata.unique_case_id);
        let mail = '';
        casedata.toemaildetail.forEach(list => {
            mail += list.toemail + ' ';
        });
        doc.createParagraph('By registered post and email');
        doc.createParagraph('To, ' + mail);
        doc.createParagraph('Dear Sir,');
        doc.createParagraph('');
        doc.createParagraph('Sub: NOTICE INVOKING ARBITRATION UNDER CLAUSE [_] OF [details of the Agreement/Contract]');
        doc.createParagraph('');
        doc.createParagraph('Ref: [Details of the Demand Notice issued to other side] ');
        doc.createParagraph('');
        doc.createParagraph('That, We are a company incorporated under the provisions of the Companies Act, 1956 and having its registered office at [__], we hereby serve you with the present notice, the contents of which are as under:] ');
        doc.createParagraph('');
        doc.createParagraph('That, We are a company incorporated under the provisions of the Companies Act, 1956 and having its registered office at [__], we hereby serve you with the present notice, the contents of which are as under:] ');
        doc.createParagraph('');
        doc.createParagraph('[details of the business of the claimant]. ');
        doc.createParagraph('');
        doc.createParagraph('2. At the outset, we states that, [mention the facts of the case, details of the agreement/contract and events transpired upto the date of Demand Notice].');
        doc.createParagraph('');
        doc.createParagraph('3. [Along with the above, also point out the relevant provisions of the agreement/contract relied upon]. ')
        doc.createParagraph('');
        doc.createParagraph('4. In view of the above continuous denial by the [Respondent Name] in clearing the outstanding recoverable Claim amounts due and payable to us. We have issued a Demand Notice dated [_], inter alia reiterating the facts mentioned hereinabove and providing details of the Claims and seeking release of the total outstanding recoverable dues of all the Claims together of [_] (“Total Outstanding Amount I.e Claim Amount”) due from the  [Respondent Name] under the [Agreement/Contract] to be payable within a period of [ period of time allowed under the demand notice] days (“Demand Notice”). ');
        doc.createParagraph('');
        doc.createParagraph('5. However, admittedly, you have failed to respond to the said Demand Notice within the prescribed period of [_] days.');
        doc.createParagraph('');
        doc.createParagraph('6. The Total Outstanding Amount payable by the [Respondent Name] to us under the [Agreement/Contract] as on date is as under:-');
        doc.createParagraph('');
        doc.createParagraph('(i) Interest at the rate of [_] % per annum on Total Outstanding Amount from the date of this notice upto the initiation of the arbitration proceedings. ');
        doc.createParagraph('(ii)  An amount of Rs. [_] towards damages suffered by Our Client on account of [reasons for claiming damages].');
        doc.createParagraph('(iii) Total Outstanding Amount of the Claims is Rs. [_], including damages details of which are more specifically mentioned hereinabove.');
        doc.createParagraph('');
        doc.createParagraph('7. The aforesaid acts and events therefore make it abundantly clear that the [Respondent Name] are unwilling to comply with their obligations under the [Agreement/Contract ] to indemnify ( Claimant Name) against all damages incurred or suffered by us based upon, resulting from or relating to any breach of warranty, undertaking or any obligation of the [Respondent Name] as well as with respect to any amount of tax liability incurred by, imposed upon, due from or payable by [Respondent Name], in relation to the period upto and including the Closing Date of the [Agreement/Contract], as set out hereinabove and under various communications issued in this regard. Thus, (Claimant Name) states that disputes have arisen between the parties and further repeated attempts to amicably settle the disputes regarding the non-payment of amounts due to them have been made. Therefore, bearing in mind the situation as set out hereinabove, we are left with no other alternative but to invoke arbitration in accordance with Clause [_] of the [Agreement/Contract]. The said arbitration clause is reproduced below for your ready reference:'); 
        doc.createParagraph('');
        doc.createParagraph('In terms of Clause [_] of the [Agreement/Contract] reproduced above, you are, therefore,requested to participate in nominating the arbitrator for this dispute. We recommend you to use e-disputeresolution.com (Click on link________) which may help us in mutually appointing a neutral single arbitrator or if you insist we can opt for three arbitrator method wherein you can appoint one arbitrator and I can appoint one arbitrator and then the both appointed arbitrator can appoint the neutral third arbitrator. Please inform us of the same within a period of 30 (thirty) days from the date of receipt of the present notice, failing which we shall be constrained to file appropriate proceedings in this regard.')
        doc.createParagraph('');
        doc.createParagraph('Yours sincerely,')
        doc.createParagraph(casedata.claimant_name);

        let url = commonfn.baseURL() + 'app/login?joincasetoken=' + casedata._id;

        doc.Footer.createParagraph('Case joining url').heading2();
        doc.Footer.createParagraph( url).heading2();
        const packer = new Packer();
        packer.toBuffer(doc).then((buffer) => {
            let filename = './uploads/noticedoc/' + commonfn.uniqueId() + '' + Date.now() + 'E-disputecaseFile.docx';
            let filepath = commonfn.baseURL() + 'images/noticedoc/' + filename;
            fs.writeFileSync(filename, buffer);
            fs.readFile(filename, "base64", function (err, data) {
                console.log(err);
                if (!err) {
                    res.setHeader("Content-Disposition", "attachment; filename=Edispute-case-file t.docx");
                    res.send(Buffer.from(data, "base64"));
                } else {
                    return res.status(400).json(err);
                }
            });
        });
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
router.get("/counterclaim/document/Create/:caseId", function (req, res) {
    Case.findOne({ _id: req.params.caseId }).exec().then(casedata => {
        const doc = new Document({
            creator: "Clippy",
            title: "Notice Case",
            description: "A brief example of using docx",
        });
        doc.Styles.createParagraphStyle("Heading1", "Heading 1")
            .basedOn("Normal")
            .next("Normal")
            .quickFormat()
            .size(28)
            .bold()
            .italics()
            .spacing({ after: 120 });
        doc.Styles.createParagraphStyle("Heading2", "Heading 2")
            .basedOn("Normal")
            .next("Normal")
            .quickFormat()
            .size(26)
            .bold()
            .spacing({ before: 240, after: 120 });

        doc.Styles.createParagraphStyle("aside", "Aside")
            .basedOn("Normal")
            .next("Normal")
            .color("999999")
            .italics()
            .indent({ left: 720 })
            .spacing({ line: 276 });

        doc.Styles.createParagraphStyle("wellSpaced", "Well Spaced")
            .basedOn("Normal")
            .spacing({ line: 276, before: 20 * 72 * 0.1, after: 20 * 72 * 0.05 });

        doc.Styles.createParagraphStyle("ListParagraph", "List Paragraph")
            .quickFormat()
            .basedOn("Normal");
            
        const numberedAbstract = doc.Numbering.createAbstractNumbering();
        numberedAbstract.createLevel(0, "lowerLetter", "%1)", "left");

        doc.createParagraph("Case Notice").heading1();
        doc.createParagraph('Date :'+commonfn.Todaydate()).heading2();
        doc.createParagraph('Ref No : Case id: ' + casedata.unique_case_id);
        let mail = '';
        casedata.toemaildetail.forEach(list => {
            mail += list.toemail + ' ';
        });
        doc.createParagraph('By registered post and email');
        doc.createParagraph('To, ' + mail);
        doc.createParagraph('Dear Sir,');
        doc.createParagraph('');
        doc.createParagraph('Sub: NOTICE INVOKING ARBITRATION UNDER CLAUSE [_] OF [details of the Agreement/Contract]');
        doc.createParagraph('');
        doc.createParagraph('Ref: [Details of the Demand Notice issued to other side] ');
        doc.createParagraph('');
        doc.createParagraph('That, We are a company incorporated under the provisions of the Companies Act, 1956 and having its registered office at [__], we hereby serve you with the present notice, the contents of which are as under:] ');
        doc.createParagraph('');
        doc.createParagraph('That, We are a company incorporated under the provisions of the Companies Act, 1956 and having its registered office at [__], we hereby serve you with the present notice, the contents of which are as under:] ');
        doc.createParagraph('');
        doc.createParagraph('[details of the business of the claimant]. ');
        doc.createParagraph('');
        doc.createParagraph('2. At the outset, we states that, [mention the facts of the case, details of the agreement/contract and events transpired upto the date of Demand Notice].');
        doc.createParagraph('');
        doc.createParagraph('3. [Along with the above, also point out the relevant provisions of the agreement/contract relied upon]. ')
        doc.createParagraph('');
        doc.createParagraph('4. In view of the above continuous denial by the [Respondent Name] in clearing the outstanding recoverable Claim amounts due and payable to us. We have issued a Demand Notice dated [_], inter alia reiterating the facts mentioned hereinabove and providing details of the Claims and seeking release of the total outstanding recoverable dues of all the Claims together of [_] (“Total Outstanding Amount I.e Claim Amount”) due from the  [Respondent Name] under the [Agreement/Contract] to be payable within a period of [ period of time allowed under the demand notice] days (“Demand Notice”). ');
        doc.createParagraph('');
        doc.createParagraph('5. However, admittedly, you have failed to respond to the said Demand Notice within the prescribed period of [_] days.');
        doc.createParagraph('');
        doc.createParagraph('6. The Total Outstanding Amount payable by the [Respondent Name] to us under the [Agreement/Contract] as on date is as under:-');
        doc.createParagraph('');
        doc.createParagraph('(i) Interest at the rate of [_] % per annum on Total Outstanding Amount from the date of this notice upto the initiation of the arbitration proceedings. ');
        doc.createParagraph('(ii)  An amount of Rs. [_] towards damages suffered by Our Client on account of [reasons for claiming damages].');
        doc.createParagraph('(iii) Total Outstanding Amount of the Claims is Rs. [_], including damages details of which are more specifically mentioned hereinabove.');
        doc.createParagraph('');
        doc.createParagraph('7. The aforesaid acts and events therefore make it abundantly clear that the [Respondent Name] are unwilling to comply with their obligations under the [Agreement/Contract ] to indemnify ( Claimant Name) against all damages incurred or suffered by us based upon, resulting from or relating to any breach of warranty, undertaking or any obligation of the [Respondent Name] as well as with respect to any amount of tax liability incurred by, imposed upon, due from or payable by [Respondent Name], in relation to the period upto and including the Closing Date of the [Agreement/Contract], as set out hereinabove and under various communications issued in this regard. Thus, (Claimant Name) states that disputes have arisen between the parties and further repeated attempts to amicably settle the disputes regarding the non-payment of amounts due to them have been made. Therefore, bearing in mind the situation as set out hereinabove, we are left with no other alternative but to invoke arbitration in accordance with Clause [_] of the [Agreement/Contract]. The said arbitration clause is reproduced below for your ready reference:'); 
        doc.createParagraph('');
        doc.createParagraph('In terms of Clause [_] of the [Agreement/Contract] reproduced above, you are, therefore,requested to participate in nominating the arbitrator for this dispute. We recommend you to use e-disputeresolution.com (Click on link________) which may help us in mutually appointing a neutral single arbitrator or if you insist we can opt for three arbitrator method wherein you can appoint one arbitrator and I can appoint one arbitrator and then the both appointed arbitrator can appoint the neutral third arbitrator. Please inform us of the same within a period of 30 (thirty) days from the date of receipt of the present notice, failing which we shall be constrained to file appropriate proceedings in this regard.')
        doc.createParagraph('');
        doc.createParagraph('Yours sincerely,')
        doc.createParagraph(casedata.claimant_name)

        // const para = doc.createParagraph();
        // para.createTextRun("Case Type:").bold();
        // para.createTextRun(casedata.case_type);
        // doc.createParagraph('Case description').heading2();
        // doc.createParagraph(casedata.case_description);
        const packer = new Packer();
        packer.toBuffer(doc).then((buffer) => {
            let filename = './uploads/noticedoc/' + commonfn.uniqueId() + '' + Date.now() + 'E-disputecaseFile.docx';
            let filepath = commonfn.baseURL() + 'images/noticedoc/' + filename;
            fs.writeFileSync(filename, buffer);
            fs.readFile(filename, "base64", function (err, data) {
                if (!err) {
                    res.setHeader("Content-Disposition", "attachment; filename=Edispute-case-file t.docx");
                    res.send(Buffer.from(data, "base64"));
                } else {
                    return res.status(400).json(err);
                }
            });
        });
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
router.get("/adminbyId/Find/:caseId", function (req, res,) {
        
        Involve.findOne({ case_id : req.params.caseId }).populate('case_id')
            .populate('party1.p1_loginid', 'name city address profileImg _id')
            .populate('party2.p2_loginid', 'name city address profileImg _id')
            .populate('arbitrator1b2b.arbitrator', 'name city address profileImg _id')
            .populate('scenario3b.p1arbitrator', 'name city address profileImg _id')
            .populate('scenario3b.p2arbitrator', 'name city address profileImg _id')
            .populate('scenario3b.commonarbitrator', 'name city address profileImg _id')
            .exec().then(involvedata => {
                return res.status(200).json(involvedata);
            }).catch(function (err) {
                return res.status(400).json(err);
            });
    
});

module.exports = router;