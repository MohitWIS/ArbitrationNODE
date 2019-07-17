var app = require('express');
var router = app.Router();
var Login = require('../login/models/login');
var Startup = require('../login/models/startup');
var Investor = require('../login/models/investor');
var Corporate = require('../login/models/corporation')
var Feedback = require('./models/feedback');
var commonfn = require('../common');
var dateTime = require('node-datetime');
var VerifyToken = require('../VerifyToken');
var nodemailer = require('nodemailer');
/*****create feedback from user****/
router.post('/create', VerifyToken, function (req, res) {
    var body = req.body;
    console.log(body);
    var loginid = req.admin_id;
    var usertype = req.usertype;
    var subject = body.subject;
    var feedbacktype = body.feedbacktype;
    var comment = body.comment;
    var Today_date = commonfn.Todaydate();
     var requirearr = [
        { "name": "subject", "value": subject, "required": true },
        { "name": "feedbacktype", "value": feedbacktype, "required": true },
        { "name": "comment", "value": comment, "required": true }
    ];
     var rdata = commonfn.validationvalue(requirearr, res);
     if(rdata!=true){
        return res.status(200).json({
            "status": "error",
            "result": rdata.result
        });
     }
    
    var filter = { $and : [ {_id: loginid},{usertype: usertype}] }; 
    Login.findOne({ _id: loginid }).select('_id email').exec().then(lData => {
        if (lData == null) {
            return res.json({
                "status": "error",
                "result": "user id not found"
            });
        }
        var Requestid = '#'+makeid();
        if(usertype =='startup'){
            Startup.findOne({ loginid: loginid }).select('_id email mobile').exec().then(sData => {
                if (sData == null) {
                    return res.json({
                        "status": "error",
                        "result": "user id not found"
                    });
                }
                var jsonData = {
                    startupuser: sData._id,
                    loginID: loginid,
                    Requestid: Requestid,
                    usertype: usertype,
                    subject: subject,
                    feedbacktype : feedbacktype,
                    createDate: Today_date
                }
                var  commentarr =[];
                var  commentjson = {};
                commentjson.comment = comment;
                commentjson.useradddate = Today_date
                commentarr.push(commentjson);
                jsonData.commentlist = commentarr;
                console.log(jsonData);
                Feedback.create(jsonData, function (err) {
                    if (err) {
                        return res.json({
                            "status": "error",
                            "result": "server error"
                        });
                    }
                    return res.json({
                        "status": "ok",
                        "result": "Feedback successfully submit"
                    });
                }); //feedback create close
            }).catch(function (err) {
                console.log(err);
                return res.json({
                    "status": "error",
                    "result": "Invaild user id"
                });
            }); //Startup catch close
        }
        if(usertype =='corporation'){
            Corporate.findOne({ loginid: loginid }).select('_id email mobile').exec().then(cData => {
                if (cData == null) {
                    return res.json({
                        "status": "error",
                        "result": "user id not found"
                    });
                }
                var jsonData = {
                    corporateuser: cData._id,
                    loginID: loginid,
                    Requestid: Requestid,
                    usertype: usertype,
                    subject: subject,
                    feedbacktype : feedbacktype,
                    createDate: Today_date
                }
                var  commentarr =[];
                var  commentjson = {};
                commentjson.comment = comment;
                commentjson.useradddate = Today_date
                commentarr.push(commentjson);
                jsonData.commentlist = commentarr;
                console.log(jsonData);
                Feedback.create(jsonData, function (err) {
                    if (err) {
                        return res.json({
                            "status": "error",
                            "result": "server error"
                        });
                    }
                    return res.json({
                        "status": "ok",
                        "result": "Feedback successfully submit"
                    });
                }); //feedback create close
            }).catch(function (err) {
                return res.json({
                    "status": "error",
                    "result": "Invaild user id"
                });
            }); //Startup catch close
        }
        if(usertype =='investor'){
            Investor.findOne({ loginid: loginid }).select('_id email mobile').exec().then(iData => {
                if (iData == null) {
                    return res.json({
                        "status": "error",
                        "result": "user id not found"
                    });
                }
                var jsonData = {
                    investoruser: iData._id,
                    loginID: loginid,
                    Requestid: Requestid,
                    usertype: usertype,
                    subject: subject,
                    feedbacktype : feedbacktype,
                    createDate: Today_date
                }
                var  commentarr =[];
                var  commentjson = {};
                commentjson.comment = comment;
                commentjson.useradddate = Today_date
                commentarr.push(commentjson);
                jsonData.commentlist = commentarr;
                console.log(jsonData);
                Feedback.create(jsonData, function (err) {
                    if (err) {
                        return res.json({
                            "status": "error",
                            "result": "server error"
                        });
                    }
                    return res.json({
                        "status": "ok",
                        "result": "Feedback successfully submit"
                    });
                }); //feedback create close
            }).catch(function (err) {
                return res.json({
                    "status": "error",
                    "result": "Invaild user id"
                });
            }); //Startup catch close
        }   
    }).catch(function (err) {
        console.log(err);
        return res.json({
            "status": "error",
            "result": "Invaild user id"
        });
    }); //user find catch close
});
/***********feedback listing fro admin*****************/
// startupuser
// corporateuser
// investoruser
// loginID
// Requestid
// usertype
// subject
// commentlist:[{
//          comment
//          useradddate
//          adminreply_id
//          adminreply
//          adminadddate
// }],
// feedbacktype
// rateus
// createDate
// isdelete: {
//     type: Number,
//     default: 0
// },
// status
router.get('/list/', VerifyToken,function (req, res) {
    var loginid = req.admin_id;
    var usertype = req.usertype;
        var findData =  { $and:[{"isdelete": 0},{usertype:usertype}]};
    Login.findOne({ _id: loginid }).select('_id email').exec().then(lData => {
        if (lData == null) {
            return res.status(400).json({
                "status": "error",
                "result": "user id not found"
            });
        }
        Feedback.find(findData).select().exec().then(fData => {
            if (fData == null) {
                return res.status(400).json({
                    "status": "error",
                    "result": "user id not found"
                });
            }
            var farrdata = [];
            var fobjdata = {};
             for (let i = 0; i < fData.length; i++) {
                fobjdata ={};
                fobjdata.Requestid = fData[i].Requestid;
                fobjdata.usertype = fData[i].usertype;
                fobjdata.Requestid = fData[i].Requestid;
                fobjdata.subject = fData[i].subject;
                 fobjdata.status = fData[i].status;
                
                fobjdata.feedbacktype = fData[i].feedbacktype;
                var create_date =  dateTime.create(fData[i].createDate);
                fobjdata.createDate = create_date.format('Y-m-d H:M:S');
                fobjdata.totalcomment = fData[i].commentlist.length;
                farrdata.push(fobjdata);
             }
             return res.status(200).json({
                "status": "ok",
                "result": farrdata
            });
        }).catch(function (err) {
            return res.status(400).json({
                "status": "error",
                "result": "Invaild Feedback id"
            });
        }); //Startup catch close
    }).catch(function (err) {
        return res.status(400).json({
            "status": "error",
            "result": "Invaild Login Id"
        });
    }); //Startup catch close
});
/*******feedback listing for  perticular**************/
router.get('/list/:id', VerifyToken,function (req, res) {
    var loginid = req.admin_id;
    var usertype = req.usertype;
    var feedback_id = req.params.id;
    var filter = { $and: [{_id: loginid },{usertype:usertype}]};
    Login.findOne(filter).select('_id email').exec().then(lData => {
        if (lData == null) {
            return res.json({
                "status": "error",
                "result": "user id not found"
            });
        }
        console.log();
        Feedback.findOne({_id: feedback_id}).populate('commentlist.adminreply_id').exec().then(fdata => {
            if (fdata==null) {
                return res.status(200).json({
                    "status": "error",
                    "result": "server error"
                });
            } 
           // console.log(fdata); //return false;
            var fobjdata = {};
            var commentobj = {};
            var commentarr = [];
                fobjdata.Requestid = fdata.Requestid;
                fobjdata.usertype = fdata.usertype;
                fobjdata.Requestid = fdata.Requestid;
                fobjdata.subject = fdata.subject;
                fobjdata.feedbacktype = fdata.feedbacktype;
                var create_date =  dateTime.create(fdata.createDate);
                fobjdata.createDate = create_date.format('Y-m-d H:M:S');
                fobjdata.totalcomment = fdata.commentlist.length;
                var commentlist = fdata.commentlist;
                for (let i = 0; i < commentlist.length; i++) {
                    commentobj = {};
                    commentobj.comment = commentlist[i].comment;
                    var useradddate =  dateTime.create(commentlist[i].useradddate);
                    commentobj.useradddate = useradddate.format('Y-m-d H:M:S');
                    commentobj.adminreply = commentlist[i].adminreply;
                    var adminadddate =  dateTime.create(commentlist[i].adminadddate);
                    commentobj.adminadddate = adminadddate.format('Y-m-d H:M:S');
                    commentarr.push(commentobj);
                }
                fobjdata.commentlist= commentarr;
                return res.status(200).json({
                    "status": "ok",
                    "result": fobjdata
                });
        });
    }).catch(function (err) {
        return res.status(400).json({
            "status": "error",
            "result": "Invaild Login Id"
        });
    }); //Startup catch close
   
});
/*****delete feedback from admin panel***/
/*admin feedback list */
router.put('/addcomment/byuser/', VerifyToken,function (req, res) {
    //find data by id
    var body = req.body;
    var loginid = req.admin_id;
    var usertype = req.usertype;
    var comment = body.comment;
    var feedback_id = body.feedback_id;
    var Today_date = commonfn.Todaydate();
    var requirearr = [
        { "name": "comment", "value": comment, "required": true },
        { "name": "feedback_id", "value": feedback_id, "required": true }
    ];
     var rdata = commonfn.validationvalue(requirearr, res);
     if(rdata!=true){
        return res.status(200).json({
            "status": "error",
            "result": rdata.result
        });
     }
     var filter = { $and : [ {_id: loginid},{usertype: usertype}] }; 
    Login.findOne(filter).select('_id email').exec().then(lData => {
        if (lData == null) {
            return res.json({
                "status": "error",
                "result": "user id not found"
            });
        }
        var filter = { _id: feedback_id};
            var pushcomment = {
                        comment : comment,
                        useradddate : Today_date,
                        adminreply_id : null,
                        adminreply : null,
                        adminadddate : null
                     };
                    var stt = { status : 'Open'}; 
                    // {   $set: {
                    //         "ratings": req.body.ratings,
                    //        },
                    //     $push: {
                    //         "RoundWiseRatings": req.body.RoundWiseRatings
                    //     }
                    // }
                    console.log(pushcomment);
                    console.log(stt);
        Feedback.findOneAndUpdate(filter, {$set: stt ,$push: { commentlist: pushcomment} }, {new: true}, function(err) {
            if (err) {
                return res.status(400).json({
                    "status": "error",
                    "result": "Feedback Id not found"
                });
            } else {
                return res.status(200).json({
                    "status": "ok",
                    "result": 'Comment Submited Successfuly!'
                });
            }
        });
    }).catch(function (err) {
        console.log(err);
        return res.json({
            "status": "error",
            "result": "Invaild user id"
        });
    }); //Startup catch close
});
router.put('/addcomment/byadmin/', VerifyToken,function (req, res) {
    //find data by id
    var body = req.body;
    var loginid = req.admin_id;
    var usertype = req.usertype;
    var comment = body.comment;
    var comment_id = body.comment_id;
    var feedback_id = body.feedback_id;
    var Today_date = commonfn.Todaydate();
    var requirearr = [
        { "name": "comment", "value": comment, "required": true },
        { "name": "comment_id", "value": comment_id, "required": true },
        { "name": "feedback_id", "value": feedback_id, "required": true }
    ];
     var rdata = commonfn.validationvalue(requirearr, res);
     if(rdata!=true){
        return res.status(200).json({
            "status": "error",
            "result": rdata.result
        });
     }
     var filter = { $and : [ {_id: loginid},{usertype: usertype}] }; 
    Login.findOne(filter).select('_id email').exec().then(lData => {
        if (lData == null) {
            return res.json({
                "status": "error",
                "result": "user id not found"
            });
        }
        var filter = {  $and:[{_id: feedback_id},{'commentlist._id': comment_id}] };
            var pushcomment = {
                       'commentlist.$.adminreply' :comment,
                       'commentlist.$.adminreply_id' : loginid,
                       'commentlist.$.adminadddate' : Today_date,
                       'status' : 'Closed'
                     };
                   // var stt = { status : 'Closed'}; 
                    console.log(pushcomment);
        Feedback.findOneAndUpdate(filter, {$set: pushcomment }, {new: true}, function(err) {
            if (err) {
                return res.status(400).json({
                    "status": "error",
                    "result": "Feedback Id not found"
                });
            } else {
                return res.status(200).json({
                    "status": "ok",
                    "result": 'Comment Submited Successfuly!'
                });
            }
        });
    }).catch(function (err) {
        console.log(err);
        return res.json({
            "status": "error",
            "result": "Invaild user id"
        });
    }); //Startup catch close
});
function sendmail(toemail, name, btnurl) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'shivpratapjnv80@gmail.com',
            pass: 'Rsg@gmail9019'
        }
    });
    var temp = commonfn.forgotpwdtemp();
    var mapObj = {
        '{name}': "shiv pratap",
        '{reset_url}': btnurl,
        '{action_url}': 'http://localhost:4200/home'
    };
    temp = temp.replace(/{name}|{reset_url}|{action_url}/gi, function (matched) {
        return mapObj[matched];
    });
    //alert(temp);
    ////console.log(temp);
    var mailOptions = {
        from: 'shiv.pratap@zaptas.com',
        to: toemail,
        subject: 'Testing forgot password',
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
function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 10; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
      return text;
  }
module.exports = router;