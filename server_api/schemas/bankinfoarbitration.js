var mongoose = require('mongoose');

var bankinfoSchema = mongoose.Schema({
    loginid: {
       type: mongoose.Schema.Types.ObjectId, ref: 'tbl_login',
        default:null
    },
    beneficiary_name: {
        type: String,
        default:null
    },
    bank_name: {
        type: String,
        default:null
    },
    account_number: {
        type: String,
        default:null
    },
    IFSC_code: {
        type: String,
        default:null
    },
    account_type: {
        type: String,
        default:null
    },
    updateDate: {
        type: Date,
        default:null
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Active"
    }
});
module.exports = mongoose.model('tbl_bankinfoarbitration',bankinfoSchema);