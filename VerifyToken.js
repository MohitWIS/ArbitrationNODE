var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file

function verifyToken(req, res, next) { 
  //console.log("shiv pratap");
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  //console.log(token);
  if (!token) 
    return res.status(500).send({ auth: false, message: 'Failed token' });

  // verifies secret and checks exp
  jwt.verify(token, config.secret, function(err, decoded) {      
    if (err){
        return res.status(500).send({ auth: false, message: 'Failed token' });
    }    
    // if everything is good, save to request for use in other routes
    req.login_id = decoded.login_id;
    req.usertype = decoded.usertype;
    req.profile_id = decoded.profile_id
    next();
  });
}
module.exports = verifyToken;