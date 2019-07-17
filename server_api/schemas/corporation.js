var mongoose = require('mongoose');

var corporationSchema = mongoose.Schema({
    loginid: {
       type: mongoose.Schema.Types.ObjectId, ref: 'logins',
        default:null
    },
    firstname: {
        type: String,
        default:null
    },
    lastname:{
        type:String,
        default:null
    },
    email:{
        type:String,
        default:null
    },
    companyname:{
        type:String,
        default:null 
    },
    jobtitle:{
        type:String,
        default:null 
    },
    websitelink: {
        type: String,
        default:null
    },
    phone: {
        type: String,
        default:null
    },
    companytype: {
        type: String,
        default:null
    },
    address:{
       type: String,
       default:null
    },
    country:{
       type: String,
       default:null
    },
    state:{
       type: String,
       default:null
    },
    city:{
       type: String,
       default:null
    },
    profileImg: {
        type: String,
        default:null
    },
    comment:{
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
    isDelete: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: "In-active"
    }
});
var Corporation = module.exports = mongoose.model('corporation', corporationSchema);