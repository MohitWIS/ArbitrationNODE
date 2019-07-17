var crypto = require('crypto');
var bodyParser = require('body-parser');
var moment = require('moment-timezone');
var fs = require('fs');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); 
var requestIp = require('request-ip');
/* add function here*/
module.exports = {


    getIp : function(req) {
       return requestIp.getClientIp(req);
    },

    //send OTP here 
    sendOTP: function(mobilenumber) {
        var number = Math.floor(1000 + Math.random() * 9000);
        var msg = encodeURIComponent("Dear user your OTP is " + number);
        var postData = {
            'authkey': '163302AEGtVUV7XJ59561b25',
            'mobiles': mobilenumber,
            'message': msg,
            'sender': 'BOKMJT',
            'route': 4
        }
        var tempOTP = 1000;
        return tempOTP;
    },
    //custom form validator
    formValidate: function(key, res) {
        //if (value == null) {
        return res.status(200).json({
            "status": "error",
            "result": key + " Required"
        });
        //}
    },
    //custom fn to check vaule is boolean
    boolValidate: function(key, res) {
        return res.status(200).json({
            "status": "error",
            "result": key + " value must be boolean"
        });
    },
    //generate unique string
    uniqueId: function() {
        function randomValueHex(len) {
            // return required number of characters
            return crypto.randomBytes(Math.ceil(len / 2)).toString('hex').slice(0, len);
        }
        var string = randomValueHex(9) + "" + randomValueHex(9) + "" + randomValueHex(9);
        return string;
        //console.log(string);
    },
    uniqueNo: function(){
          var text = "";
          var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

          for (var i = 0; i < 5; i++){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
          }
          return text;
        //console.log(makeid());
    },
    uniqueNo2: function(str){
        var text = "";
        var text2 = "";
        var possible = str+"ABCDEFGHIJKLMNOPhijklmnopqrstuvwxyz";
        var possible2 = "4567012389";
        for (var i = 0; i < 3; i++){
            text += possible.charAt(Math.floor(Math.random() * possible.length));
          }
        for (var j = 0; j < 3; j++){
          text2 += possible2.charAt(Math.floor(Math.random() * possible2.length));
        }
        return text+text2;
  },
    //set base url here
    baseURL: function() {
        //var url = 'http://132.148.158.82:3001/';
        var url = 'http://localhost:3000/';
        return url;
    },
    baseURL2: function() {
        //var url = 'http://132.148.158.82:3001/';
        var url = 'http://localhost:4200/';
        return url;
    },
    adminbaseUrl: function() {
        //var url = 'http://collaboration.zaptas.com:3000/';
        var url = 'http://sparsh-foundation.com/';
        return url;
    },
    adminbaseUrl2: function() {
        //var url = 'http://collaboration.zaptas.com:3000/';
        var url = 'http://localhost:4500/';
        return url;
    },
    //generate unique id for user as per role
    userHash: function(usertype,mobile) {
        var date = dt.format('Y-m-d H:M:S:N');
        console.log(date);
        var string = date + '-' + usertype+'-'+mobile;
        var hash = crypto.createHash('md5').update(string).digest('hex');
        return hash;
        //var 
    },
    //get client ip as per header request
    getClientIp: function(req) {
        var ip = (req.headers["X-Forwarded-For"] || req.headers["x-forwarded-for"] || '').split(',')[0] || req.client.remoteAddress;
        return ip;
    },
    //remove file from folder.
    removeArrFile: function(filename) {
        //listOfFiles.forEach(function(filename) {
        try {
            fs.unlinkSync(filename);
            console.log('successfully deleted');
        } catch (err) {
            // handle the error
            //console.log(err);
        }
    },
    //replace in string.
    replaceString: function(a, b, c){
        //a is base string 
        //b string has to be replce from string a with c.
        d = a.replace(b, c);
        
        return d;
       // console.log(d);
    },
    //email verify from database
    emailVerify: function(useremail) {
        User.find({
            email: useremail
        }, function(req, res) {
            if (res.length == 0) {
                return true;
            } else {
                
                return false;
            }
        });
        
    },
    mobileVerify: function(mobileno) {
        User.find({
            mobile: mobileno
        }, function(req, res) {
            if (res.length == 0) {
                return true;
            } else {
                return false;
            }
        });
    },

 Today_date: function() {

    var Today_date = new Date();
    var format = 'YYYY-MM-DD HH:mm:ss';
    var bookingtime = moment(Today_date, format).tz('Asia/Kolkata').format(format);
    
    return bookingtime;
        
    },

Today_date_format: function(f_ormat) {

    var Today_date = new Date();
    var bookingtime = moment(Today_date, f_ormat).tz('Asia/Kolkata').format(f_ormat);
    return bookingtime;
        
    },
    dateFormat: function(date,dformat) {
        var fdate = moment(date, f_ormat).tz('Asia/Kolkata').format(dformat);
        return fdate;  
        },
Todaydate: function(){

        var Today_date = new Date();
        var format = 'YYYY-MM-DD HH:mm:ss';
        var Today_date = moment(Today_date, format).tz('Asia/Kolkata').format(format)
        return Today_date;
    },
 getDates: function(startDate, stopDate ,f_ormat) {
    //console.log(startDate)
    var dateArray = [];
    var currentDate = moment(startDate);
    var stopDate = moment(stopDate);
    while (currentDate <= stopDate) {
        dateArray.push( moment(currentDate).format(f_ormat) )
        currentDate = moment(currentDate).add(1, 'days');
    }
    return dateArray;
},

send_mail: function(){
        var transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'shivpratapjnv80@gmail.com',
                pass: '9015286526'
              }
            });

            var mailOptions = {
              from: 'shivpratapjnv80@gmail.com',
              to: 'shiv.pratap@appcodeindia.com',
              subject: 'Testing using Node.js',
              text: 'Hi I am testing mode !'
            };

            transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
            });      
   }, 
  forgotpwdtemp:function(){
      
     var temp = '<table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin: 0; padding: 0; width: 100%;" bgcolor="#F2F4F6"> <tr> <td align="center" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; word-break: break-word;"> <table class="email-content" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin: 0; padding: 0; width: 100%;"> <tr> <td class="email-masthead" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; padding: 25px 0; word-break: break-word;" align="center"> <a href="http://132.148.158.82:3001" class="email-masthead_name" style="box-sizing: border-box; color: #bbbfc3; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;"> E-dispute </a> </td></tr><tr> <td class="email-body" width="100%" cellpadding="0" cellspacing="0" style="-premailer-cellpadding: 0; -premailer-cellspacing: 0; border-bottom-color: #EDEFF2; border-bottom-style: solid; border-bottom-width: 1px; border-top-color: #EDEFF2; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin: 0; padding: 0; width: 100%; word-break: break-word;" bgcolor="#FFFFFF"> <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin: 0 auto; padding: 0; width: 570px;" bgcolor="#FFFFFF"> <tr> <td class="content-cell" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; padding: 35px; word-break: break-word;"> <h1 style="box-sizing: border-box; color: #2F3133; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 19px; font-weight: bold; margin-top: 0;" align="left">Hi {name},</h1> <p style="box-sizing: border-box; color: #74787E; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;" align="left">You recently requested to reset your password for your E-dispute account. Use the button below to reset it. <strong style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif;">This password reset is only valid for the next 24 hours.</strong></p><table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin: 30px auto; padding: 0; text-align: center; width: 100%;"> <tr> <td align="center" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; word-break: break-word;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif;"> <tr> <td align="center" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; word-break: break-word;"> <table border="0" cellspacing="0" cellpadding="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif;"> <tr> <td style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; word-break: break-word;"> <a href="{reset_url}"  target="_blank" style="-webkit-text-size-adjust: none; background: #22BC66; border-color: #22bc66;cursor:pointer; border-radius: 3px; border-style: solid; border-width: 10px 18px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); box-sizing: border-box; color: #FFF; display: inline-block; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; text-decoration: none;">Reset your password</a> </td></tr></table> </td></tr></table> </td></tr></table> <p style="box-sizing: border-box; color: #74787E; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;" align="left">If you did not request a password reset, please ignore this email.<p style="box-sizing: border-box; color: #74787E; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;" align="left">Thanks, <br/>The E-dispute Team</p><table class="body-sub" style="border-top-color: #EDEFF2; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin-top: 25px; padding-top: 25px;"> <tr> <td style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; word-break: break-word;"> <p class="sub" style="box-sizing: border-box; color: #74787E; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="left"</p><p class="sub" style="box-sizing: border-box; color: #74787E; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="left"></p></td></tr></table> </td></tr></table> </td></tr><tr> <td style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; word-break: break-word;"> <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin: 0 auto; padding: 0; text-align: center; width: 570px;"> <tr> <td class="content-cell" align="center" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; padding: 35px; word-break: break-word;"> <p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center">© 2019 [Product Name]. All rights reserved.</p><p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center"> [Company Name, LLC] <br/>1234 Street Rd. <br/>Suite 1234 </p></td></tr></table> </td></tr></table> </td></tr></table>';
        // href="https://example.com"
      return temp;
  },
   adminforgotpwdtemp:function(){
      
    var temp = '<table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin: 0; padding: 0; width: 100%;" bgcolor="#F2F4F6"> <tr> <td align="center" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; word-break: break-word;"> <table class="email-content" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin: 0; padding: 0; width: 100%;"> <tr> <td class="email-masthead" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; padding: 25px 0; word-break: break-word;" align="center"> <a href="http://132.148.158.82:3001" class="email-masthead_name" style="box-sizing: border-box; color: #bbbfc3; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 16px; font-weight: bold; text-decoration: none; text-shadow: 0 1px 0 white;"> E-dispute </a> </td></tr><tr> <td class="email-body" width="100%" cellpadding="0" cellspacing="0" style="-premailer-cellpadding: 0; -premailer-cellspacing: 0; border-bottom-color: #EDEFF2; border-bottom-style: solid; border-bottom-width: 1px; border-top-color: #EDEFF2; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin: 0; padding: 0; width: 100%; word-break: break-word;" bgcolor="#FFFFFF"> <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin: 0 auto; padding: 0; width: 570px;" bgcolor="#FFFFFF"> <tr> <td class="content-cell" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; padding: 35px; word-break: break-word;"> <h1 style="box-sizing: border-box; color: #2F3133; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 19px; font-weight: bold; margin-top: 0;" align="left">Hi {name},</h1> <p style="box-sizing: border-box; color: #74787E; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;" align="left">Congratulations, you are connected with our E-dispute Team. Please kindly make patience until we will reach you. <strong style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif;"></strong></p><table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin: 30px auto; padding: 0; text-align: center; width: 100%;"> <tr> <td align="center" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; word-break: break-word;"> <table width="100%" border="0" cellspacing="0" cellpadding="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif;"> <tr> <td align="center" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; word-break: break-word;"> <table border="0" cellspacing="0" cellpadding="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif;"> <tr> <td style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; word-break: break-word;"> <a href="{reset_url}"  target="_blank" style="-webkit-text-size-adjust: none; background: #22BC66; border-color: #22bc66;cursor:pointer; border-radius: 3px; border-style: solid; border-width: 10px 18px; box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16); box-sizing: border-box; color: #FFF; display: inline-block; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; text-decoration: none;">Reset Password</a> </td></tr></table> </td></tr></table> </td></tr></table> <p style="box-sizing: border-box; color: #74787E; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;" align="left"><p style="box-sizing: border-box; color: #74787E; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 16px; line-height: 1.5em; margin-top: 0;" align="left">Thanks, <br/>The E-dispute Team</p><table class="body-sub" style="border-top-color: #EDEFF2; border-top-style: solid; border-top-width: 1px; box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin-top: 25px; padding-top: 25px;"> <tr> <td style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; word-break: break-word;"> <p class="sub" style="box-sizing: border-box; color: #74787E; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="left"</p><p class="sub" style="box-sizing: border-box; color: #74787E; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="left"></p></td></tr></table> </td></tr></table> </td></tr><tr> <td style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; word-break: break-word;"> <table class="email-footer" align="center" width="570" cellpadding="0" cellspacing="0" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; margin: 0 auto; padding: 0; text-align: center; width: 570px;"> <tr> <td class="content-cell" align="center" style="box-sizing: border-box; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; padding: 35px; word-break: break-word;"> <p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center">© 2019 [Product Name]. All rights reserved.</p><p class="sub align-center" style="box-sizing: border-box; color: #AEAEAE; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 12px; line-height: 1.5em; margin-top: 0;" align="center"> [Company Name, LLC] <br/>1234 Street Rd. <br/>Suite 1234 </p></td></tr></table> </td></tr></table> </td></tr></table>';
       // href="https://example.com"
     return temp;
 },
  enquirytemp:function(){
     var temp ='<table border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background-color: #f6f6f6;"><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td><td class="container" style="font-family: sans-serif; font-size: 14px; vertical-align: top; display: block; Margin: 0 auto; max-width: 580px; padding: 10px; width: 580px;"><div class="content" style="box-sizing: border-box; display: block; Margin: 0 auto; max-width: 580px; padding: 10px;"> <span class="preheader" style="color: transparent; display: none; height: 0; max-height: 0; max-width: 0; opacity: 0; overflow: hidden; mso-hide: all; visibility: hidden; width: 0;">This is preheader text. Some clients will show this text as a preview.</span><table class="main" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%; background: #ffffff; border-radius: 3px;"><tr><td class="wrapper" style="font-family: sans-serif; font-size: 14px; vertical-align: top; box-sizing: border-box; padding: 20px;"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"><tr><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;"><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Hi {name},</p><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Thanks for your kind Interest. We will connect with you shortly..</p><p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; Margin-bottom: 15px;">Support Team</p></td></tr></table></td></tr></table><div class="footer" style="clear: both; Margin-top: 10px; text-align: center; width: 100%;"><table border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; mso-table-lspace: 0pt; mso-table-rspace: 0pt; width: 100%;"><tr><td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; font-size: 12px; color: #999999; text-align: center;"> <br> <a href="{action_url}" style="text-decoration: underline; color: #999999; font-size: 12px; text-align: center;">Collaboration Team</a>.</td></tr></table></div></div></td><td style="font-family: sans-serif; font-size: 14px; vertical-align: top;">&nbsp;</td></tr></table>';
     return temp;
  },
  casetemp:function(){
    var temp = '<div style="padding-right: 15px;padding-left: 15px;margin-right: auto;margin-left: auto;"> <div style="width: 100%;text-align: center;"> <img src="http://arbitration.zaptas.com:3001/assets/images/logo.png" style="margin-top: 5px;margin:0;padding:0;" alt="Singtel" title="Singtel"/> </div><div style="margin-right: -15px; margin-left: -15px;"> <div style="width: 100%;float: left;position: relative; min-height: 1px; padding-right: 15px; padding-left: 15px;box-sizing: border-box;"> <div style="border-radius: 3px; box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.16), 0 2px 10px 0 rgba(0, 0, 0, 0.12); padding: 15px 25px; text-align: left; display: block; margin-top: 15px;margin-bottom: 10px;box-sizing: border-box;"> <br/> <p style="text-align:justify;font-style:normal;font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; font-size: 14px;"> Hi <b> @name </b>,</p><br/> <p style="text-align:justify;font-style:normal;font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; font-size: 14px;"> Case Type : @casetype </p><p style="text-align:justify;font-style:normal;font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; font-size: 14px;"> @description </p><br/><br/> <p style="text-align:justify;font-style:normal;font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; font-size: 14px;"> For customer enquiries, please contact our customer care team <span style="color:#002469"> 01254587</span> </p><br/> <div> <a href="@joinurl" style="text-decoration: none; padding: 5px 23px;background: #af5c2e; color: #fff;"> Join </a> </div><br/> <p style="text-align:center;font-style:italic;font-family: Arial, "Helvetica Neue", Helvetica, sans-serif; font-size: 12px;"> This is a notification-only email address. Please do not reply to this message.</p></div></div></div>';
    return temp;  
  },
  otptemp:function(){
    var temp = '<div id="mailsub" class="notification" align="center"><table width="100%" border="0" cellspacing="0" cellpadding="0" style="min-width: 320px;"><tr><td align="center" ><table border="0" cellspacing="0" cellpadding="0" class="table_width_100" width="100%" style="max-width: 680px; min-width: 300px;"><tr><td><div style="height: 80px; line-height: 80px; font-size: 10px;"> </div></td></tr><tr><td align="center" bgcolor="#ffffff"><div style="height: 30px; line-height: 30px; font-size: 10px;"> </div><table width="90%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center" bgcolor="#fbfcfd"><table width="90%" border="0" cellspacing="0" cellpadding="0"><tr><td align="center"><div style="line-height: 24px;"> <a href="#" target="_blank" style="color: #596167; font-family: Arial, Helvetica, sans-serif; font-size: 13px;"> <font face="Arial, Helvetica, sans-seri; font-size: 13px;" size="3" color="#596167"> <img src="http://arbitration.zaptas.com:3001/assets/images/logo.png" width="193" height="43" alt="30-DAYS FREE TRIAL" border="0" style="display: block;" /></font></a></div><div style="height: 30px; line-height: 60px; font-size: 10px;"> </div></td></tr><tr><td align="left"><div style="line-height: 44px;"> <font face="Arial, Helvetica, sans-serif" size="5" color="#57697e" style="font-size: 22px;"> Dear {name},<br> <span style="font-family: Arial, Helvetica, sans-serif; font-size: 22px; color: #57697e;"> Your Verification Code is: {code} </span></font></div><div style="height: 20px; line-height: 40px; font-size: 10px;"> </div></td></tr><tr><td align="left"><div style="line-height: 24px;"> <font face="Arial, Helvetica, sans-serif" size="4" color="#57697e" style="font-size: 15px;"> <span style="font-family: Arial, Helvetica, sans-serif; font-size: 15px; color: #57697e;"> Thanks!<br> <a href="{action_url}"> E-dispute Team</a> </span></font></div><div style="height: 40px; line-height: 40px; font-size: 10px;"> </div></td></tr></table></td></tr></table></td></tr></table></div>';
    return temp;
  },
  validationvalue :function(valarr,res){
          for (let i = 0; i < valarr.length; i++) {
              var val = valarr[i].value;
              var name = valarr[i].name;
                if (val=='' || val =='undefined' ||  val == undefined ||  val =='null' ||  val ==null) {
                    var data ={
                        "status": "error",
                        "result": name + " Required"
                    } 
                    return data;
                }      
          }
          return true;
  },
};