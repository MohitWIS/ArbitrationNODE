var mongoose = require('mongoose');

var party2casependingSchema = mongoose.Schema({

    case_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_case',
        default: null
    },
    loginid: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
        default: null
    },
    createDate: {
        type: Date,
        default: Date.now
    },

});
module.exports = mongoose.model('tbl_party2caseList', party2casependingSchema);