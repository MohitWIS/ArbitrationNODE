var app = require('express');
var router = app.Router();
var Professional = require('../schemas/professional');
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
    Professional.find({ "status": "Active" }, function(err, data) { 
        if (data) {
            return res.status(200).json(data);
        }else{
            return res.status(400).json({ "error": "server error" });
        }
    }); 
});
router.get("/Findbyid", VerifyToken, function(req, res, next) {
    var filter = { $and: [{ "status": "Active" }, { "loginid": req.login_id }] };

   // { "$sort": { "venues.shows.show_time": 1 } }
    Professional.findOne(filter).sort({'workexperience.adddate': -1}).exec().then(data => {
        console.log(data);
        return res.status(200).json(data);

    }).catch(function (err) {
        return res.status(400).json(err);
    });
   
});
router.get("/party/Findbyid/:loginId", VerifyToken, function(req, res, next) {
    let loginId =req.params.loginId;
    var filter = { $and: [{ "status": "Active" }, { "loginid": loginId }] };
    Professional.findOne(filter, function (err, data) {
        if (err) {
            return res.status(400).json({ "error": "server error" });
        }
        return res.status(200).json(data);
    });
});
/* education create */
router.post("/Create", VerifyToken, function(req, res, next) {
    var body = req.body ? req.body : '';
     //console.log(body); 
    var jsondata = {  
            loginid : req.login_id,
            description : body.description,
            experience_erbitration :  body.experience_erbitration,
            areas_expertise :  body.areas_expertise,
            total_Years_Working_Arbitration :  body.total_Years_Working_Arbitration,
            functional_area_arbitration :  body.functional_area_arbitration,
            address_as_per_gov_approved_id :  body.address_as_per_gov_approved_id,
            professional_publications :  body.professional_publications,
            membership_professional :  body.membership_professional,
            no_of_arbitration_awards :  body.no_of_arbitration_awards,
            workexperience : body.itemRows,
            createDate : commonfn.Todaydate()
    };
    //console.log(jsondata);
    Professional.create(jsondata, function (err, data) {
        if (data) {
            Login.findOneAndUpdate({ _id: req.login_id }, { 'profilestt.Professional' : true}, { new: true }, function (err) {
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
     console.log(body); //return false;
    var jsondata = {
            loginid : req.login_id,
            description : body.description,
            experience_erbitration :  body.experience_erbitration,
            areas_expertise :  body.areas_expertise,
            total_Years_Working_Arbitration :  body.total_Years_Working_Arbitration,
            functional_area_arbitration :  body.functional_area_arbitration,
            address_as_per_gov_approved_id :  body.address_as_per_gov_approved_id,
            professional_publications :  body.professional_publications,
            membership_professional :  body.membership_professional,
            no_of_arbitration_awards :  body.no_of_arbitration_awards,
            workexperience : body.itemRows,
            updateDate : commonfn.Todaydate()
    };
   // console.log(jsondata);
    Professional.findOneAndUpdate({ _id: body.professional_id }, jsondata, { new: true }, function (err, data) {
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
        Professional.findByIdAndRemove({ _id: professional_id }, function (err) {
            if (err) {
                return res.status(200).json(err);
            }
            return res.status(200).json({ "result": "Education Removed Successfully!!" });
        });
});
router.post("/Push", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = { 
        title: body ? body.title : '',
        organisation: body ? body.organisation : '',
        location: body ? body.location : '',
        from_month: body ? body.from_month : '',
        from_year: body ? body.from_year : '',
        to_month: body.to_month ? body.to_month : '',
        to_year: body.to_year ? body.to_year : '',
        currentlyworking: body.currentlyworking ? body.currentlyworking : false
    };
    // console.log(jsondata);
    // {$push: {friends: friend}}
    Professional.findOneAndUpdate({ loginid: req.login_id }, { $push: { workexperience: jsondata } },{ new: true}, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }

    });
});
router.put("/Update/experience", VerifyToken, function(req, res, next) {
    var body = req.body ? req.body : '';
    var jsondata = {
            total_Years_Working_Arbitration :  body.total_Years_Working_Arbitration,
            functional_area_arbitration :  body.functional_area_arbitration,
            areas_expertise :  body.areas_expertise,
            updateDate : commonfn.Todaydate()
    };
    //console.log(jsondata);
    Professional.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
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
        'workexperience.$.title': body ? body.title : '',
        'workexperience.$.organisation': body ? body.organisation : '',
        'workexperience.$.location': body ? body.location : '',
        'workexperience.$.from_month': body ? body.from_month : '',
        'workexperience.$.from_year': body ? body.from_year : '',
        'workexperience.$.to_month': body ? body.to_month : '',
        'workexperience.$.to_year': body ? body.to_year : '',
        'workexperience.$.currentlyworking': body ? body.currentlyworking : false
    };
      //console.log(jsondata);
      Professional.findOneAndUpdate({ 'workexperience._id': body.id}, { $set: jsondata },  { new: true },function(err ,data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
});
router.put("/Update/profile", VerifyToken, function(req, res, next) {
    var body = req.body ? req.body : '';
     console.log(body); //return false;
    var jsondata = {
            description : body.description,
            experience_erbitration :  body.experience_erbitration,
            areas_expertise :  body.areas_expertise,
            total_Years_Working_Arbitration :  body.total_Years_Working_Arbitration,
            professional_publications :  body.professional_publications,
            membership_professional :  body.membership_professional,
            no_of_arbitration_awards :  body.no_of_arbitration_awards,
            updateDate : commonfn.Todaydate()
    };
    Professional.findOneAndUpdate({ loginid: req.login_id }, jsondata, { new: true }, function (err, data) {
        if (data) {
            return res.status(200).json(data);
        } else {
            return res.status(400).json(err);
        }
    });
    
});
router.put("/sub/Remove", VerifyToken, function (req, res, next) {
    var body = req.body ? req.body : '';
   // console.log(body);
   Professional.findOneAndUpdate({ "loginid": req.login_id}, {$pull: {"workexperience": { "_id": { $in: body.workexperience_id } }}}, { "multi": true}, function(err, flights) {
        if (!err) {
            return res.status(200).json({
                "msg": "Successfully deleted"
            });
        } else {
            return res.status(400).json(err);
        }
    }); //Package find and update close
    //console.log(jsondata);
});

module.exports = router;