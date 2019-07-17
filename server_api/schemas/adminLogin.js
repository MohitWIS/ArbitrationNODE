var mongoose = require('mongoose');
var adminLoginSchema = mongoose.Schema({
    Name: {
        type: String,
        default: null
    },
    Email: {
        type: String,
        default: null
    },
    Phone:{
        type: String,
        default:null
    },
    Password: {
        type: String,
        default: null
    },
    Address:{
        type: String,
        default: null
    },
    Userid: {
        type: String,
        default: null
    },
    RoleId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_roleAdmin',
        default:null
    },
    Token: {
        type: String,
        default: null
    },
    Usertype: {
        type: String,
        default: null
    },
    lastLogindate: {
        type: Date,
        default: null
    },
    totalLogin: {
        type: Number,
        default: 0
    },
    lastLoginip: {
        type: String,
        default: null
    },
    CreatedBy: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_adminLogin',
        default:null
    },
    CreatedAt: {
        type: Date,
        default: Date.now
    },
    UpdatedAt: {
        type: Date,
        default: Date.now
    },
    Status: {
        type: String,
        default: "Active"
    }
});
module.exports = mongoose.model('tbl_adminLogin', adminLoginSchema);