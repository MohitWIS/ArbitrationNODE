var app = require('express');
var router = app.Router();
var Login = require('../schemas/login');
var Profile = require('../schemas/profile');
var Personal = require('../schemas/personaldetails');
var Education = require('../schemas/education');
var Professional = require('../schemas/professional');
var Public = require('../schemas/publicprofile');
var Fees = require('../schemas/arbitrationfees');
var Bank = require('../schemas/bankinfoarbitration');
var multer = require('multer');
var commonfn = require('../../common');
var moment = require('moment-timezone');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var VerifyToken = require('../../VerifyToken');
var nodemailer = require('nodemailer');
/* milter for upload images */

/* file storage path */
function setupload_dir(dir_path) {
    var fileStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './uploads/' + dir_path)
        },
        filename: function (req, file, cb) {
            //console.log(file.mimetype);
            var ext = file.mimetype.split("/");
            cb(null, commonfn.uniqueId() + '' + Date.now() + '.' + ext[1]);
        }
    });
    var upload = multer({
        storage: fileStorage
    }).any(); //file storage path
    return upload;
}
/* root for flight */
router.get("/", function (req, res, next) {
    return res.status(400).json({
        "status": "error",
        "result": "Bad request"
    });
});
/* Login request for admin */
router.post("/personaldetails/create", VerifyToken, function (req, res, next) {
    var currUpload = setupload_dir('personal');
    currUpload(req, res, function (err) {
        if (err) {
            console.log(err);
            return res.status(200).json({
                "status": "error",
                "result": "Please upload only jpg and png image!"
            });
        }
        var body = req.body;
        console.log(body);
        var login_id = req.login_id;
        var usertype = req.usertype;
        var firstname = body.firstname;
        var middlename = body.middlename;
        var lastname = body.lastname;
        var dob = body.dob;
        var nationality = body.nationality;
        var gender = body.gender;
        var fathername = body.fathername;
        var pancard = body.pancard;
        var alternatemobile = body.alternatemobile;
        var pincode = body.pincode;
        var address_as_per_gov_approved_id = body.address_as_per_gov_approved_id;
        //var photograph = body. ;
        var requirearr = [
            { "name": "firstname", "value": firstname, "required": true },
            { "name": "lastname", "value": lastname, "required": true },
            { "name": "dob", "value": dob, "required": true },
            { "name": "nationality", "value": nationality, "required": true },
            { "name": "gender", "value": gender, "required": true },
            { "name": "pincode", "value": pincode, "required": true },
            { "name": "pincode", "value": pincode, "required": true }
        ];
        var rdata = commonfn.validationvalue(requirearr, res);
        if (rdata != true) {
            return res.status(200).json({
                "status": "error",
                "result": rdata.result
            });
        }
        var jsondata = {};

        jsondata.loginid = login_id;
        jsondata.firstname = firstname;
        jsondata.middlename = middlename;
        jsondata.lastname = lastname;
        jsondata.dob = dob;
        jsondata.nationality = nationality;
        jsondata.gender = gender;
        jsondata.fathername = fathername;
        //jsondata.pancard = pancard;
        jsondata.alternatemobile = alternatemobile;
        jsondata.pincode = pincode;
       // jsondata.address_as_per_gov_approved_id = address_as_per_gov_approved_id;
        jsondata.createDate = commonfn.Todaydate();
        var files = req.files;
        console.log(jsondata);
        //jsondata.photograph = files[0].filename;

        Personal.findOne({ loginid: login_id }).exec().then(getData => {
            console.log(getData)
            if (getData == null) {
                Personal.create(jsondata, function (err, data) {
                    if (err) {
                        console.log(err);
                        return res.status(200).json({
                            "status": "error",
                            "result": "Server Error"
                        });
                    }

                    return res.status(200).json({
                        "status": "ok",
                        "result": "Added Personal Profile"
                    });
                });

            }
            return res.status(200).json({
                "status": "ok",
                "result": "Allreay added personal profile"
            });

        }).catch(function (err) {
            console.log(err);
            return res.status(400).json({
                "status": "error",
                "result": "Please Enter Valid Username and Password"
            });
        }); //admin find close

    });

});
router.post("/educationdetails/create", VerifyToken, function (req, res, next) {
    var body = req.body;
    var login_id = req.login_id;
    var usertype = req.usertype;
    var itemRows = body.itemRows;
    var achievement_societies = body.achievement_societies;
    console.log(body);
    var jsondata = {};
    var eduarr = [];
    var eduobj = {};
    var address_as_per_gov_approved_id = body.address_as_per_gov_approved_id;
    //var photograph = body. ;
    var requirearr = [
        { "name": "login_id", "value": login_id, "required": true },
        { "name": "User Type", "value": usertype, "required": true }
    ];
    var rdata = commonfn.validationvalue(requirearr, res);
    if (rdata != true) {
        return res.status(200).json({
            "status": "error",
            "result": rdata.result
        });
    }
    if (Array.isArray(itemRows) == false) {
        return res.status(200).json({
            "status": "error",
            "result": "Please Enter Educational Details"
        });
    }
    for (var i = 0; i < itemRows.length; i++) {
        var edidata = itemRows[i];
        eduobj ={};
        if (edidata.universitycollege == undefined || edidata.universitycollege == "") {
            eduobj.universitycollege  = null;
        }else{
            eduobj.universitycollege  = edidata.universitycollege;
        }
        if (edidata.degree == undefined || edidata.degree == "") {
            return res.status(200).json({
                "status": "error",
                "result": "Please Enter Degree"
            });
        }
        eduobj.degree = edidata.degree;
        if (edidata.field_of_study == undefined || edidata.field_of_study == "") {
            return res.status(200).json({
                "status": "error",
                "result": "Please Enter field of study"
            });
        }
        eduobj.field_of_study = edidata.field_of_study;
        if (edidata.grade == undefined || edidata.grade == "") {
            eduobj.grade = null;
        }else{
            eduobj.grade = edidata.grade;
        }
        if (edidata.from_year == undefined || edidata.from_year == "") {
            return res.status(200).json({
                "status": "error",
                "result": "Please Enter From Year"
            });
        }
        eduobj.from_year = edidata.from_year;
        if (edidata.to_year == undefined || edidata.to_year == "") {
            return res.status(200).json({
                "status": "error",
                "result": "Please Enter To Year"
            });
        }
        eduobj.to_year = edidata.to_year;
        if (edidata.description == undefined || edidata.description == "") {
            var description = null;
            eduobj.description = null;
        }else{
            eduobj.description = edidata.description;
        }
        eduarr.push(eduobj);

    }


    jsondata.loginid = login_id;
    jsondata.createDate = commonfn.Todaydate();
    jsondata.achievement_societies = achievement_societies;
    jsondata.educationaldetails = eduarr;


    Education.findOne({ loginid: login_id }).exec().then(getData => {
        if (getData == null) {
            Education.create(jsondata, function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(200).json({
                        "status": "error",
                        "result": "Server Error"
                    });
                }
            });
            return res.status(200).json({
                "status": "ok",
                "result": "Education Added Successfully!!"
            });

        }
        return res.status(200).json({
            "status": "ok",
            "result": "Allreay added Education"
        });

    }).catch(function (err) {
        console.log(err);
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    }); //admin find close
});
router.post("/professional/create", VerifyToken, function (req, res, next) {
    var body = req.body;
    var login_id = req.login_id;
    var usertype = req.usertype;
    var description = body.description;
    var experience_erbitration = body.experience_erbitration;
    var areas_expertise = body.areas_expertise;
    var total_Years_Working_Arbitration = body.total_Years_Working_Arbitration;
    var functional_area_arbitration = body.functional_area_arbitration;
    var address_as_per_gov_approved_id = body.address_as_per_gov_approved_id;
    var professional_publications = body.professional_publications;
    var membership_professional = body.membership_professional;
    var no_of_arbitration_awards = body.no_of_arbitration_awards;
    var itemRows = body.itemRows;
    console.log(body);
    if (description == undefined || description == "") {
        description = null;
    }
    if (experience_erbitration == undefined || experience_erbitration == "") {
        experience_erbitration = null;
    }
    if (areas_expertise == undefined || areas_expertise == "") {
        areas_expertise = null;
    }
    if (total_Years_Working_Arbitration == undefined || total_Years_Working_Arbitration == "") {
        total_Years_Working_Arbitration = null;
    }
    if (functional_area_arbitration == undefined || functional_area_arbitration == "") {
        functional_area_arbitration = null;
    }
    if (address_as_per_gov_approved_id == undefined || address_as_per_gov_approved_id == "") {
        address_as_per_gov_approved_id = null;
    }
    if (professional_publications == undefined || professional_publications == "") {
        professional_publications = null;
    }
    if (membership_professional == undefined || membership_professional == "") {
        membership_professional = null;
    }
    if (no_of_arbitration_awards == undefined || no_of_arbitration_awards == "") {
        no_of_arbitration_awards = null;
    }
    var jsondata = {};
    var eduarr = [];
    jsondata.description = description;
    jsondata.experience_erbitration = experience_erbitration;
    jsondata.areas_expertise = areas_expertise;
    jsondata.total_Years_Working_Arbitration = total_Years_Working_Arbitration;
    jsondata.functional_area_arbitration = functional_area_arbitration;
    jsondata.address_as_per_gov_approved_id = address_as_per_gov_approved_id;
    jsondata.professional_publications = professional_publications;
    jsondata.membership_professional = membership_professional
    jsondata.no_of_arbitration_awards = no_of_arbitration_awards;
    jsondata.createDate = commonfn.Todaydate();
    if (Array.isArray(itemRows) == false) {
        return res.status(200).json({
            "status": "error",
            "result": "Please Enter workexperience"
        });
    }
    for (var i = 0; i < itemRows.length; i++) {
        var edidata = itemRows[i];
        if (edidata.title == undefined || edidata.title == "") {
            return res.status(200).json({
                "status": "error",
                "result": "Please Enter Title"
            });
        }
        if (edidata.organisation == undefined || edidata.organisation == "") {
            return res.status(200).json({
                "status": "error",
                "result": "Please Enter Organisation"
            });
        }
        if (edidata.location == undefined || edidata.location == "") {
            return res.status(200).json({
                "status": "error",
                "result": "Please Enter Location"
            });
        }
        if (edidata.from_month == undefined || edidata.from_month == "") {
            return res.status(200).json({
                "status": "error",
                "result": "Please From Month"
            });
        }
        if (edidata.from_year == undefined || edidata.from_year == "") {
            return res.status(200).json({
                "status": "error",
                "result": "Please Enter From Year"
            });
        }
        if (edidata.to_month == undefined || edidata.to_month == "") {
            return res.status(200).json({
                "status": "error",
                "result": "Please Enter To Month"
            });
        }
        if (edidata.to_year == undefined || edidata.to_year == "") {
            return res.status(200).json({
                "status": "error",
                "result": "Please Enter To Year"
            });
        }
        eduarr.push({
            title: edidata.title,
            organisation: edidata.organisation,
            location: edidata.location,
            from_month: edidata.from_month,
            from_year: edidata.from_year,
            to_year: edidata.to_year,
            to_month: edidata.to_month
        });

    }
    jsondata.workexperience = eduarr;

    Professional.findOne({ loginid: login_id }).exec().then(getData => {
        if (getData == null) {
            Professional.create(jsondata, function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(200).json({
                        "status": "error",
                        "result": "Server Error"
                    });
                }
            });
            return res.status(200).json({
                "status": "ok",
                "result": "Added Professional details"
            });

        }
        return res.status(200).json({
            "status": "ok",
            "result": "Allreay added Professional Details"
        });

    }).catch(function (err) {
        //console.log(err);
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    }); //admin find close
});
router.post("/publicprofile/create", VerifyToken, function (req, res, next) {

    var body = req.body;
    var login_id = req.login_id;
    var usertype = req.usertype;
    var public_profile = body.public_profile;
    var headline = body.headline;
    var add_case_type = body.add_case_type;
    if (public_profile == undefined || public_profile == "") {
        public_profile = null;
    }
    if (headline == undefined || headline == "") {
        headline = null;
    }
    // createDate

    var jsondata = {};
    var eduarr = [];

    jsondata.loginid = login_id;
    jsondata.public_profile = public_profile;
    jsondata.headline = headline;
    jsondata.createDate = commonfn.Todaydate();
    if (Array.isArray(add_case_type) == false) {
        return res.status(200).json({
            "status": "error",
            "result": "Please Select add case type"
        });
    }
    for (let i = 0; i < add_case_type.length; i++) {
        eduarr.push(add_case_type[i]);
    }
    jsondata.add_case_type = eduarr;

    Public.findOne({ loginid: login_id }).exec().then(getData => {
        if (getData == null) {
            Public.create(jsondata, function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(200).json({
                        "status": "error",
                        "result": "Server Error"
                    });
                }
            });
            return res.status(200).json({
                "status": "ok",
                "result": "Added Public Profile"
            });

        }
        return res.status(200).json({
            "status": "ok",
            "result": "Allreay added Public profile"
        });

    }).catch(function (err) {
        //console.log(err);
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    }); //admin find close


});
router.post("/arbitrationfees/create", VerifyToken, function (req, res, next) {

    var body = req.body;
    var login_id = req.login_id;
    var usertype = req.usertype;
    var arbitration_fee = body.arbitration_fee;

    //var photograph = body. ;
    var requirearr = [
        { "name": "arbitration_fee", "value": arbitration_fee, "required": true }
    ];
    var rdata = commonfn.validationvalue(requirearr, res);
    if (rdata != true) {
        return res.status(200).json({
            "status": "error",
            "result": rdata.result
        });
    }
    var jsondata = {};

    jsondata.loginid = login_id;
    jsondata.arbitration_fee = arbitration_fee;
    jsondata.createDate = commonfn.Todaydate();

    Fees.findOne({ loginid: login_id }).exec().then(getData => {
        if (getData == null) {
            Fees.create(jsondata, function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(200).json({
                        "status": "error",
                        "result": "Server Error"
                    });
                }
            });
            return res.status(200).json({
                "status": "ok",
                "result": "Added Fees Successfully!!"
            });

        }
        return res.status(200).json({
            "status": "ok",
            "result": "Allreay added Fees"
        });

    }).catch(function (err) {
        //console.log(err);
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    }); //admin find close
});
router.post("/bankdetails/create", VerifyToken, function (req, res, next) {
    var body = req.body;
    var login_id = req.login_id;
    var usertype = req.usertype;
    var beneficiary_name = body.beneficiary_name;
    var bank_name = body.bank_name;
    var account_number = body.account_number;
    var IFSC_code = body.IFSC_code;
    var account_type = body.account_type;

    //var photograph = body. ;
    var requirearr = [
        { "name": "beneficiary_name", "value": beneficiary_name, "required": true },
        { "name": "bank_name", "value": bank_name, "required": true },
        { "name": "account_number", "value": account_number, "required": true },
        { "name": "IFSC_code", "value": IFSC_code, "required": true },
        { "name": "account_type", "value": account_type, "required": true }
    ];

    var rdata = commonfn.validationvalue(requirearr, res);
    if (rdata != true) {
        return res.status(200).json({
            "status": "error",
            "result": rdata.result
        });
    }
    var jsondata = {};
    jsondata.loginid = login_id;
    jsondata.beneficiary_name = beneficiary_name;
    jsondata.bank_name = bank_name;
    jsondata.account_number = account_number;
    jsondata.IFSC_code = IFSC_code;
    jsondata.account_type = account_type;
    jsondata.createDate = commonfn.Todaydate();

    Bank.findOne({ loginid: login_id }).exec().then(getData => {
        if (getData == null) {
            Bank.create(jsondata, function (err, data) {
                if (err) {
                    console.log(err);
                    return res.status(200).json({
                        "status": "error",
                        "result": "Server Error"
                    });
                }
            });
            return res.status(200).json({
                "status": "ok",
                "result": "Added Account Details"
            });

        }
        return res.status(200).json({
            "status": "ok",
            "result": "Allreay added Account Details"
        });

    }).catch(function (err) {
        //console.log(err);
        return res.status(400).json({
            "status": "error",
            "result": "Please Enter Valid Username and Password"
        });
    }); //admin find close
});
module.exports = router;