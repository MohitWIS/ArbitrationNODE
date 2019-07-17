var mongoose = require('mongoose');

var draftSchema = mongoose.Schema({
    case_id : {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_case',
         default:null
     },
     profileId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
        default: null
    },
    draft :{
        type: String,
        default:null
    },
    counterstt: {
        type: Number,
        default:0
    },
    updateDate: {
        type: Date,
        default:null
    },
    createDate: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('tbl_casedraft',draftSchema);