var app = require('express');
var router = app.Router();
var commonfn = require('../../common');
var Notification = require('../schemas/notification');
var Login = require('../schemas/login');
var Profile = require('../schemas/profile');
var VerifyToken = require('../../VerifyToken');

router.get("/Find/party/:type/:seenstt", VerifyToken, function (req, res, next) {
    let profile_id = req.profile_id;
    let filter = { $and: [{ "profileidfor": profile_id }, { "type": req.params.type }] };
    if (req.params.seenstt == 0 || req.params.seenstt ==1) {
        filter.$and.push({ seenstt : req.params.seenstt}) ;
      }
    Notification.find(filter).sort('-createdate').populate('profileidby').populate('profileidfor').exec().then(data => {
        return res.status(200).json(data);
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
router.get("/Find/arbitrator/:seenstt", VerifyToken, function (req, res, next) {
    let profile_id = req.profile_id;
    let filter = { $and: [{ "profileidfor": profile_id }, { "type": 'Notification' }] };
    if (req.params.seenstt == 0 || req.params.seenstt ==1) {
        filter.$and.push({ seenstt : req.params.seenstt}) ;
      }
    Notification.find(filter).sort('-createdate').populate('profileidby').populate('profileidfor').exec().then(Ndata => {
            let filter2 = { $and: [{ "profileidfor": profile_id }, { "type": 'Activity' }] };
            Notification.find(filter2).sort('-createdate').exec().then(Adata => {
                    return res.status(200).json({"Notification" : Ndata ,"Activity": Adata });
            }).catch(function (err) {
                return res.status(400).json(err);
            });
      
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
router.get("/Find/arbitrator/:type/:seenstt", VerifyToken, function (req, res, next) {
    let profile_id = req.profile_id;
    let filter = { $and: [{ "profileidfor": profile_id }, { "type": req.params.type }] };
    if (req.params.seenstt == 0 || req.params.seenstt ==1) {
        filter.$and.push({ seenstt : req.params.seenstt}) ;
      }
    Notification.find(filter).sort('-createdate').populate('profileidby').populate('profileidfor').exec().then(data => {

                    return res.status(200).json(data);
              
    }).catch(function (err) {
        return res.status(400).json(err);
    });
});
router.put("/UpdateStatus", VerifyToken, function (req, res, next) {
    const body = req.body;
    Notification.updateMany({ _id: { $in: body.notiarr } }, { $set: { seenstt : 1 } }, { new: true }, function (err, data) {
        if (!err) {
            return res.status(200).json(data);
        }else{
            return res.status(400).json(err);
        }
    });
});

module.exports = router;