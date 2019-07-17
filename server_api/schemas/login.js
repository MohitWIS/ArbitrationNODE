var mongoose = require('mongoose');
var loginSchema = mongoose.Schema({
    name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    mobile: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    userid: {
        type: String,
        default: null
    },
    otp: {
        type: String,
        default: null
    },
    otpverify: {
        type: String,
        default: 'Pending'
    },
    token: {
        type: String,
        default: null
    },
    usertype: {
        type: String,
        default: null
    },
    profilestt: {
        Personal: {
            type: Boolean,
            default: false
        },
        Education: {
            type: Boolean,
            default: false
        },
        Professional: {
            type: Boolean,
            default: false
        },
        Public: {
            type: Boolean,
            default: false
        },
        Fees: {
            type: Boolean,
            default: false
        },
        Bank: {
            type: Boolean,
            default: true
        }
    },
    logout_all: {
        type: Boolean,
        default: false
    },
    partyPayment: {
        type: Boolean,
        default: false
    },
    notification: {
        type: Boolean,
        default: false
    },
    lastlogindate: {
        type: Date,
        default: null
    },
    totallogin: {
        type: Number,
        default: null
    },
    lastloginip: {
        type: String,
        default: null
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Pending"
    },
    homestt: {
        type: String,
        default: "Active"
    },
    rejectcomment:{
        type: String,
        default: null 
    },
    loginstt :{
        type: Boolean,
        default: false
    }
});
module.exports = mongoose.model('tbl_login', loginSchema);