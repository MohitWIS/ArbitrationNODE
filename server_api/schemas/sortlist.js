var mongoose = require('mongoose');

var shortlistSchema = mongoose.Schema({
    case_id: {
       type: mongoose.Schema.Types.ObjectId, ref: 'tbl_case',
        default:null
    },
    arbitrator_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
        default:null
    },
    professional_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_professional',
        default:null
    },
    fees_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_arbitrationfees',
        default:null
    },
    profileId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
        default:null
    },
    createDate: {
        type: Date,
        default: Date.now
    },
});
module.exports = mongoose.model('tbl_shortlist', shortlistSchema);