var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file

function PwdVerifyToken(req, res, next) { 
    var body = req.body;
    var token = body.token;
    if (!token) 
    return res.status(200).send({ status:'error',auth: false, message: 'No token provided.' });

  // verifies secret and checks exp
  jwt.verify(token, config.secret, function(err, decoded) {      
    if (err){
        console.log(err);
        return res.status(200).send({ status:'reset',auth: false, message: 'Please send reset passwaord mail again.' });
    }    
    // if everything is good, save to request for use in other routes
    req.AdminId = decoded.AdminId;
    req.Email = decoded.Email;
    
    //console.log(req.admin_id);
    next();
  });
}

module.exports = PwdVerifyToken;