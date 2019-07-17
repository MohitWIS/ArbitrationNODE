var mongoose = require('mongoose');
var contactUsSchema = mongoose.Schema({
    name: {
        type: String,
        default: null
    },
    mobile:{
        type: String,
        default:null
    },
    email: {
        type: String,
        default: null
    },
    city: {
        type: String,
        default: null
    },
    message: {
        type: String,
        default: null
    },
    createDate: {
        type: Date,
        default: Date.now
    },
});
module.exports = mongoose.model('tbl_contactUs', contactUsSchema);