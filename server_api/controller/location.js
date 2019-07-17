var app = require('express');
var router = app.Router();
var city = require('../schemas/city');
var VerifyToken = require('../../VerifyToken');

router.get("/", function (req, res, next) {
    return res.status(400).json({
        "status": "error",
        "result": "Bad request"
    });
});
router.post('/list/city',function (req, res) {
    var body = req.body;
    
    if (body.searchkey == undefined) {
        return res.status(200).json([]);
    }
    var filterligin = { $and: [  
             { "city_name": { $regex: body.searchkey, $options: 'i' } },
             { "country_id": "5c976ba641e3f849a36370aa" }] };

            // console.log(body);
            // console.log(filterligin);
    city.find(filterligin).select('_id city_name').sort({ city_name: 1 }).limit(50).exec().then(data => {
         // console.log(data);    
        return res.status(200).json(data);
            
    }).catch(function (err) {
        //console.log(err)
        return res.status(400).json({
            "status": "error",
            "result": "Please contact admin"
        });
    });
});
router.get('/list/allcity',function (req, res) {
    
    var filterligin = { $and: [  
             { "country_id": "5c976ba641e3f849a36370aa" }] };

    city.find(filterligin).select('_id city_name').sort({ city_name: 1 }).exec().then(data => {
         // console.log(data);    
        return res.status(200).json(data);
            
    }).catch(function (err) {
        //console.log(err)
        return res.status(400).json({
             "error": "Please contact admin"
        });
    });
});
module.exports = router;