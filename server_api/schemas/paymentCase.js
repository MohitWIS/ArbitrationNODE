var mongoose = require('mongoose');

var paymentSchema = mongoose.Schema({

    case_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_case',
        default: null
    },
   
    partyProfileId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
        default: null
    },
    arbitratorProfileid: [{ 
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
        default: null
    }],
    amount: {
        type: String,
        default: null
    },
    transactionId:{
        type: String,
        default: null
    },
    dateOfpayment: {
        type: Date,
        default: Date.now
    },
    note:{
        type: String,
        default: null
    },
    usertype:{
        type: String,
        default: null
    },
    status: {
        type: String,
        default: "Active"
    },
    createdate: {
        type: Date,
        default: Date.now
    }
});
module.exports = mongoose.model('tbl_payment', paymentSchema);