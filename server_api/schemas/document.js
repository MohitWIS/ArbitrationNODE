var mongoose = require('mongoose');

var documentSchema = mongoose.Schema({
    loginid: {
       type: mongoose.Schema.Types.ObjectId, ref: 'tbl_login',
        default:null
    },
    case_id : {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_case',
         default:null
     },
    title: {
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
    partytype:{
        type: String,
        default:null
    },
    uploaded_by : {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_login',
        default:null
    },
    documents:{
        type: String,
        default:null
    },
    size : {
        type: Number,
        default:null
    },
    status: {
        type: Boolean,
        default: false
    }
});
module.exports = mongoose.model('tbl_documents',documentSchema);