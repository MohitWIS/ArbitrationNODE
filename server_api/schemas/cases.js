var mongoose = require('mongoose');
var caseSchema = mongoose.Schema({
    loginid: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_login',
        default: null
    },
    unique_case_id: {
        type: String,
        default: null
    },
    claimant_name: {
        type: String,
        default: null
    },
    case_type: {
        type: String,
        default: null
    },
    claim_amount: {
        type: Number,
        default: null
    },
    CounterClaimstt: {
        type: Boolean,
        default: false
    },
    CounterClaimAmount: {
        type: Number,
        default: null
    },
    counterNoticestt :{
        type: Boolean,
        default: false
    },
    notknowCounterClaimAmount: {
        type: Boolean,
        default: true
    },
    CounterClaimby: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
        default: null
    },
    CounterDescription: {
        type: String,
        default: null
    },
    Countertoemaildetail: [{
        toaddress: {
            type: String,
            default: null
        },
        toemail: {
            type: String,
            default: null
        },
        tophone: {
            type: String,
            default: null
        },
        to_reference: {
            type: String,
            default: null
        },
        filename: {
            type: String,
            default: null
        },
        originalname: {
            type: String,
            default: null
        },
        size: {
            type: Number,
            default: 0
        }
    }
    ],
    Counterfromemaildetail: [{
        fromaddress: {
            type: String,
            default: null
        },
        fromemail: {
            type: String,
            default: null
        },
        fromphone: {
            type: String,
            default: null
        },
        from_reference: {
            type: String,
            default: null
        },
        filename: {
            type: String,
            default: null
        },
        originalname: {
            type: String,
            default: null
        },
        size: {
            type: Number,
            default: 0
        }
    }
    ],
    respodent_name: {
        type: String,
        default: null
    },
    notknow_claim_amount: {
        type: Boolean,
        default: false
    },
    agreement: {
        type: String,
        default: false
    },
    file: {
        type: String,
        default: null
    },
    originalFile: {
        type: String,
        default: null
    },
    size: {
        type: Number,
        default: 0
    },
    Noticestt :{
        type: Boolean,
        default: false
    },
    final_notice_file: {
        type: String,
        default: null
    },
    final_notice_size: {
        type: Number,
        default: null
    },
    case_description: {
        type: String,
        default: null
    },
    scenario: {
        type: String,
        default: null
    },
    fromaddress: {
        type: String,
        default: null
    },
    fromemail: {
        type: String,
        default: null
    },
    from_reference: {
        type: String,
        default: null
    },
    toemaildetail: [{
        toaddress: {
            type: String,
            default: null
        },
        toemail: {
            type: String,
            default: null
        },
        tophone: {
            type: String,
            default: null
        },
        to_reference: {
            type: String,
            default: null
        },
        filename: {
            type: String,
            default: null
        },
        originalname: {
            type: String,
            default: null
        },
        size: {
            type: Number,
            default: 0
        }
    }
    ],
    fromemaildetail: [{
        fromaddress: {
            type: String,
            default: null
        },
        fromemail: {
            type: String,
            default: null
        },
        fromphone: {
            type: String,
            default: null
        },
        from_reference: {
            type: String,
            default: null
        },
        filename: {
            type: String,
            default: null
        },
        originalname: {
            type: String,
            default: null
        },
        size: {
            type: Number,
            default: 0
        }
    }
    ],
    updateDate: {
        type: Date,
        default: null
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    casestt: {
        type: String,
        default: "UNDERDISCUSSION"
    }
});
module.exports = mongoose.model('tbl_case', caseSchema);