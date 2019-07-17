var mongoose = require('mongoose');
var recommendlistSchema = mongoose.Schema({
    case_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_case',
        default: null
    },
    partytype: {
        type: String,
        default: null
    },
    ploginid: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_login',
        default: null
    },
    arbitrator_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
        default: null
    },
    arbitrator_loginid: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_login',
        default: null
    },
    fees : {
        type: Number,
        default: 0
    },
    experience:{
        type: Number,
        default: 0
    },
    scenario:{
        type: String,
        default: null
    },
    createDate: {
        type: Date,
        default: Date.now
    },
});
module.exports = mongoose.model('tbl_recommendlist', recommendlistSchema);