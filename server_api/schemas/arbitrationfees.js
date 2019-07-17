var mongoose = require('mongoose');

var arbitrationfeesSchema = mongoose.Schema({
    loginid: {
       type: mongoose.Schema.Types.ObjectId, ref: 'tbl_login',
        default:null
    },
    arbitration_fee: {
        type: Number,
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
var Admin = module.exports = mongoose.model('tbl_arbitrationfees',arbitrationfeesSchema);