var app = require('express');
var router = app.Router();
var Document = require('../schemas/document');
var Involve = require('../schemas/caseinvolve');
var commonfn = require('../../common');
var Case = require('../schemas/cases');
var VerifyToken = require('../../VerifyToken');
var nodemailer = require('nodemailer');
var multer = require('multer');
let modelCallback = require('./modelCallback');

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
router.get("/Find", VerifyToken, function (req, res, next) {
   
    Document.find({ "status": "Active" }).sort({_id:-1}).populate('loginid' , 'name email').exec().then(data => {
      
            return res.status(200).json(data);
       
        }).catch(function (err) {
            return res.status(400).json(err);
        });
});
router.get("/Findbyid/:case_id", VerifyToken, function (req, res, next) {
    var case_id = req.params.case_id;
    var filter = { $and: [{ "case_id": case_id }] };
    Document.find(filter).sort({_id:-1}).populate('loginid' , 'name email').exec().then(data => {
       
            return res.status(200).json(data);
       
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
router.post("/Create", VerifyToken, function (req, res, next) {
    var currUpload = setupload_dir('document');
    currUpload(req, res, function (err){
        if (err) {
            return res.status(400).json(err);
        } else {
            var body = req.body;
            console.log(body);
            var jsondata = {
                loginid: req.login_id,
                case_id: body ? body.case_id : '',
                title: body ? body.title : '',
                status: body ? body.status : '',
                uploaded_by: req.loginid,
                createDate: commonfn.Todaydate()
            };
            var files = req.files;
            if (files.length > 0) {
                jsondata.documents = files[0].filename;
                jsondata.size = (files[0].size) / 1024;
            }
            const noticestt = body.noticestt ? body.noticestt :'';
            if(noticestt){
               let jsonnotice = {};
                if(noticestt == 'Party 1'){
                     jsonnotice =  { Noticestt : true};
                }else if(noticestt == 'Party 2'){
                     jsonnotice =  { counterNoticestt : true};
                }
                console.log(jsonnotice);
                Case.findOneAndUpdate({ _id: body.case_id }, jsonnotice, { new: true }, function (err, data) {
                    if(!err){
                       return true;
                    }else{
                        return true;
                    }
                   
                });
            }
           
            Involve.findOne({ case_id: body.case_id }, function (err, cdata){
                if (!err) {
                    var party1 = cdata.party1.p1_loginid;
                    var party2 = cdata.party2.p2_loginid;
                    if (party1 == req.profile_id) {
                        jsondata.partytype = 'Party 1';
                       
                    }else if (party2 == req.profile_id) {
                        jsondata.partytype = 'Party 2';
                    }else {
                        jsondata.partytype = 'arbitrator';
                    }
                    // console.log(jsondata.partytype);
                     //console.log( jsondata.partytype);
                    Document.create(jsondata, function (err, data) {
                        if (!err) {
                            let notidata = [];
                            if(jsondata.partytype == 'party 2'){
                                notidata.push({
                                    profileidby: req.profile_id,
                                    profileidfor: req.profile_id,
                                    caseId: cdata.case_id,
                                    type: 'Activity',
                                    desc: 'Pdf Uploaded document for case',
                                    createdate: commonfn.Todaydate()
                                });
                                notidata.push({
                                    profileidby: req.profile_id,
                                    profileidfor: cdata.party1.p1_loginid,
                                    caseId: cdata.case_id,
                                    type: 'Notification',
                                    desc:  'Pdf document Uploaded  by ' + jsondata.partytype + ' for case',
                                    createdate: commonfn.Todaydate()
                                });
                            }else if(jsondata.partytype == 'party 1'){
                                notidata.push({
                                    profileidby: req.profile_id,
                                    profileidfor: req.profile_id,
                                    caseId: cdata.case_id,
                                    type: 'Activity',
                                    desc: 'Pdf Uploaded document for case',
                                    createdate: commonfn.Todaydate()
                                });
                                notidata.push({
                                    profileidby: req.profile_id,
                                    profileidfor: cdata.party2.p2_loginid,
                                    caseId: cdata.case_id,
                                    type: 'Notification',
                                    desc:  'Pdf document Uploaded  by ' + jsondata.partytype + ' for case',
                                    createdate: commonfn.Todaydate()
                                }); 
                            }else{
                                notidata.push({
                                    profileidby: req.profile_id,
                                    profileidfor: req.profile_id,
                                    caseId: cdata.case_id,
                                    type: 'Activity',
                                    desc: 'Pdf Uploaded document for case',
                                    createdate: commonfn.Todaydate()
                                });
                                notidata.push({
                                    profileidby: req.profile_id,
                                    profileidfor: cdata.party1.p1_loginid,
                                    caseId: cdata.case_id,
                                    type: 'Notification',
                                    desc:  'Pdf document Uploaded  by ' + jsondata.partytype + ' for case',
                                    createdate: commonfn.Todaydate()
                                });   
                            }
                             if (cdata.scenario == 'Scenario 2' || cdata.scenariobyparty2 == 'Scenario 2'){
                                if (cdata.scenario3b.p1arbitrator != req.profile_id) {
                                    notidata.push({
                                        profileidby: req.profile_id,
                                        profileidfor: cdata.scenario3b.p1arbitrator,
                                        caseId: body.case_id,
                                        type: 'Notification',
                                        desc: 'Pdf Documents updated by '+ jsondata.partytype,
                                        createdate: commonfn.Todaydate()
                                    });
                                }
                                if(cdata.scenario3b.p2arbitrator != req.profile_id){
                                    notidata.push({
                                        profileidby: req.profile_id,
                                        profileidfor: cdata.scenario3b.p2arbitrator,
                                        caseId: body.case_id,
                                        type: 'Notification',
                                        desc: 'Pdf Documents updated by '+ jsondata.partytype,
                                        createdate: commonfn.Todaydate()
                                    });
                                }
                                if(cdata.scenario3b.commonarbitrator != req.profile_id){
                                    notidata.push({
                                        profileidby: req.profile_id,
                                        profileidfor: cdata.scenario3b.commonarbitrator,
                                        caseId: body.case_id,
                                        type: 'Notification',
                                        desc: 'Pdf Documents updated by '+ jsondata.partytype,
                                        createdate: commonfn.Todaydate()
                                    })
                                }
                               } else {
                                notidata.push({
                                    profileidby: req.profile_id,
                                    profileidfor: cdata.arbitrator1b2b.arbitrator!=null ? cdata.arbitrator1b2b.arbitrator:null,
                                    caseId: body.case_id,
                                    type: 'Notification',
                                    desc: 'Pdf Documents updated by '+ jsondata.partytype,
                                    createdate: commonfn.Todaydate()
                                });
                            }
                            
                            modelCallback.NotiAdd(notidata, function (result){
                                return res.status(200).json(data);
                            });
                        } else {
                            return res.status(400).json(err);
                        }
                    });
                } else {
                    return res.status(400).json({ "error": "server error" });
                }
            });
        }
    });
});
router.put("/Update", VerifyToken, function (req, res, next) {
    var currUpload = setupload_dir('document');
    currUpload(req, res, function (err) {
        if (err) {
            return res.status(400).json(err);
        } else {
            var body = req.body ? req.body : '';
            var jsondata = {
                title: body ? body.title : '',
                status: body ? body.status : '',
                uploaded_by: req.loginid,
                createDate: commonfn.Todaydate()
            };
            var files = req.files;
            if (files.length > 0) {
                jsondata.documents = files[0].filename;
            }
            Document.findOneAndUpdate({ _id: body.document_id }, jsondata, { new: true }, function (err, data) {
                if (data) {
                    return res.status(200).json(data);
                } else {
                    return res.status(400).json(err);
                }
            });
        }
    });
});

module.exports = router;