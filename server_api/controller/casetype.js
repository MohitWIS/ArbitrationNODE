var app = require('express');
var router = app.Router();
var Ctype = require('../schemas/casetype');
var commonfn = require('../../common');
var VerifyToken = require('../../VerifyToken');

router.get("/", function (req, res, next) {
    return res.status(500).json({
        "status": "error",
        "result": "Bad request"
    });
});
router.get("/Find", function (req, res, next) {
    Ctype.find({ "status": "Active" }).sort({name : 1}).exec().then(data => {
                return res.status(200).json(data);
        }).catch(function (err) {
            return res.status(400).json(err);
        });
});
router.get("/Findbyid", VerifyToken, function (req, res, next) {
    var filter = { $and: [{ "status": "Active" }, { "loginid": req.login_id }] };
    Ctype.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
router.post("/Create", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        loginid: req.login_id,
        createDate: commonfn.Todaydate(),
        name: body ? body.name : ''
    };
    Ctype.create(jsondata, function (err, data) {
        if (!err) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/Update", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
        loginid: req.login_id,
        updateDate: commonfn.Todaydate(),
        name: body ? body.name : ''
    };
    Ctype.findOneAndUpdate({ _id: body.ctype_id }, jsondata, { new: true }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.delete("/Remove", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    Ctype.findByIdAndRemove({ _id: body.ctype_id }, function (err) {
        if (err) {
            return res.status(200).json(err);
        }
        return res.status(200).json({ "result": "Education Removed Successfully!!" });
    });
});
module.exports = router;