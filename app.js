const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const http = require("http");
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var path = require('path');
var io = require('socket.io');

 // For Localhost
mongoose.connect("mongodb://localhost:27017/edispute",{ useNewUrlParser: true , 'useCreateIndex': true , 'useFindAndModify': false});
 // for server
//mongoose.connect("mongodb://edispute:Rsggmail8@localhost:27017/edispute",{ useNewUrlParser: true , 'useCreateIndex': true , 'useFindAndModify': false});

const db = mongoose.connection;
//console.log(db);
/* check contenet type here that must be json*/
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.urlencoded({ 
    'extended': 'true'
}));
app.use(bodyParser.json());
app.use(bodyParser.json({
    type: 'application/vnd.api+json'
}));
app.use('/images', express.static(__dirname+'/uploads/'));
 app.use(express.static(path.join(__dirname,'dist')));
// app.get('*',(req,res)=>{
//   res.sendFile(path.join(__dirname,'dist/index.html'));
// }); 
/* CORS Middleware */
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});
//root 
app.get('/', function(req, res) {
    return res.status(200).json({
        "status": "ok",
        "result": "Welcome to collaboration"
    });
});
/* Call users and admin main directories*/
var userLogin = require('./server_api/login');
var adminLogin = require('./server_api/controller/adminLogin');
var profiledata = require('./server_api/controller/profile');
var personaldata = require('./server_api/controller/personaldetails');
var educationdata = require('./server_api/controller/education');
var professionaldata = require('./server_api/controller/professional');
var publicprofiledata = require('./server_api/controller/publicprofile');
var arbitrationfeesdata = require('./server_api/controller/arbitrationfees');
var bankdata = require('./server_api/controller/bankinfoarbitration');
var locationdata = require('./server_api/controller/location');
var casesdata = require('./server_api/controller/cases');
var casetypedata = require('./server_api/controller/casetype');
var documentdata = require('./server_api/controller/document');
var caseinvolvedata = require('./server_api/controller/caseinvolve');
var arbitratordata = require('./server_api/controller/arbitrator');
var sortlistdata = require('./server_api/controller/sortlist');
var paymentCasedata = require('./server_api/controller/paymentCase');
var notificationedata = require('./server_api/controller/notification');
var casedraftdata = require('./server_api/controller/casedraft');

app.use('/userauth/', userLogin);
app.use('/adminauth/', adminLogin);
app.use('/profile/', profiledata);
app.use('/education/', educationdata);
app.use('/personal/', personaldata);
app.use('/professional/', professionaldata);
app.use('/public/', publicprofiledata);
app.use('/arbitrationfees/', arbitrationfeesdata);
app.use('/bank/', bankdata); 
app.use('/location/', locationdata);
app.use('/cases/', casesdata);
app.use('/ctype/', casetypedata);
app.use('/document/', documentdata);
app.use('/caseinvolve/', caseinvolvedata);
app.use('/arbitrator/', arbitratordata);
app.use('/sortList/', sortlistdata);
app.use('/payment/', paymentCasedata);
app.use('/notification/', notificationedata);
app.use('/draft/', casedraftdata);

const port = process.env.PORT || 3000;
const server = http.createServer(app);

// load consumer.js and pass it the socket.io object
var con =require('./socket/socketConnection.js');
//var io = require('socket.io')(server);
global.io = require('socket.io')(server);  
con.start();

server.listen(port);
console.log("conected");