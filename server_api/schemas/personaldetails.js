var mongoose = require('mongoose');

var personalSchema = mongoose.Schema({
    loginid: {
       type: mongoose.Schema.Types.ObjectId, ref: 'tbl_login',
        default:null
    },
    firstname: {
        type: String,
        default:null
    },
    middlename:{
        type:String,
        default:null
    },
    lastname:{
        type:String,
        default:null
    },
    dob:{
        type:Date,
        default:null
    },
    nationality: {
        type: String,
        default:null
    },
    gender: {
        type: String,
        default:null
    },
    fathername: {
        type: String,
        default:null
    },
    pancard: {
        type: String,
        default:null
    },
    alternatemobile: {
        type: String,
        default:null
    },
    pincode: {
        type: String,
        default:null
    },
    address_gov: {
        type: String,
        default:null
    },
    photograph: {
        type: String,
        default:null
    },
    updateDate: {
        type: Date,
        default:null
    },
    noofcase:{
      type:Number,
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
var Admin = module.exports = mongoose.model('tbl_personal',personalSchema);