var mongoose = require('mongoose');

var caseinvolveSchema = mongoose.Schema({

    caseId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_case',
        default: null
    },
    msglist: [{
        ProfileId: {
            type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
            default: null
        },
        msg: {
            type: String,
            default: null
        },
        usertype: {
            type: String,
            default: null
        }
    }
    ],
    createDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Active"
    }
});
module.exports = mongoose.model('tbl_caseinvolve', caseinvolveSchema);