var mongoose = require('mongoose');
//Genre schema for country code
var countryCodes = mongoose.Schema({
    country: [{
        name: String,
        countryCode: String,
        phoneCode: String
    }]
});
var CountryCodes = module.exports = mongoose.model('countries', countryCodes);