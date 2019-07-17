var mongoose = require('mongoose');

var publicSchema = mongoose.Schema({
    loginid: {
       type: mongoose.Schema.Types.ObjectId, ref: 'tbl_login',
        default:null
    },
    public_profile: {
        type: String,
        default:null
    },
    headline: {
        type: String,
        default:null
    },
    add_case_type: [
        {type: String,
        default:null}
    ],
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
var Admin = module.exports = mongoose.model('tbl_publicprofile',publicSchema);