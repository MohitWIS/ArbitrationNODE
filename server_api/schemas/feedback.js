var mongoose = require('mongoose');

var feedbackSchema = mongoose.Schema({

    startupuser: { type: mongoose.Schema.Types.ObjectId, ref: 'startup' , default:null  },
    corporateuser: { type: mongoose.Schema.Types.ObjectId, ref: 'corporation' , default:null },
    investoruser: { type: mongoose.Schema.Types.ObjectId, ref: 'investor', default:null },
    loginID: { type: mongoose.Schema.Types.ObjectId, ref: 'logins', default:null },
    Requestid:{
        type: String,
        default:null   
    },
    usertype:{
        type: String,
        default:null
    },
    subject:{
        type: String,
        default:null
    },
    commentlist:[{
             comment:{type: String, default:null},
             useradddate:{type: Date, default:null},
             adminreply_id:{type: mongoose.Schema.Types.ObjectId,ref: 'admins', default:null},
             adminreply:{type: String, default:null},
             adminadddate:{type: String, default:null}
    }],
    feedbacktype:{
        type: String,
        default:null
    },
    rateus: {
        type: Number,
        default: null
    },
    createDate: {
        type: Date,
        timezone: "Asia/Kolkata",
        default: Date.now()
    },
    isdelete: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: 'Open'
    }
});
module.exports = mongoose.model('feedbacks', feedbackSchema);