var mongoose = require('mongoose');
var profileSchema = mongoose.Schema({
    loginid: {
       type: mongoose.Schema.Types.ObjectId, ref: 'tbl_login',
        default:null
    },
    professional_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_professional',
         default:null
     },
    name: {
        type: String,
        default:null
    },
    mobile:{
        type: String,
        default:null
    },
    email:{
        type:String,
        default:null
    },
    usertype:{
        type:String,
        default:null
    },
    city:{
        type:String,
        default:null
    },
    totalAmount:{
        type:Number,
        default:0
    },
    address:{
        type:String,
        default:null
    },
    gender:{
        type:String,
        default:null
    },
    profileImg: {
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
        default: "Pending"
    },
    homestt: {
        type: String,
        default: "Active"
    },
    
});
module.exports = mongoose.model('tbl_profile', profileSchema);