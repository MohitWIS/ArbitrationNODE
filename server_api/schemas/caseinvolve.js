var mongoose = require('mongoose');
var caseinvolveSchema = mongoose.Schema({
    case_id: {
        type: mongoose.Schema.Types.ObjectId, ref: 'tbl_case',
        default: null
    },
    party1: {
        p1_loginid: {
            type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
            default: null
        },
        add_date: {
            type: Date,
            default: null
        }
    },
    party2: {
        p2_loginid: {
            type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
            default: null
        },
        joinstt: {
            type: String,
            default: 'Pending'
        },
        add_date: {
            type: Date,
            default: null
        },
    },
    arbitrator1b2b: {
        arbitrator: {
            type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
            default: null
        },
        byprofileid: {
            type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
            default: null
        },
        partytype: {
            type: String,
            default: null
        },
        add_date: {
            type: Date,
            default: null
        }
    },
    scenario3b: {
        p1arbitrator: {
            type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
            default: null
        },
        p1arbitratorDate:{
            type: Date,
            default: null
        },
        p2arbitrator: {
            type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
            default: null
        },
        p2arbitratorDate:{
            type: Date,
            default:null 
        }, 
        commonarbitrator: {
            type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
            default: null
        },
        chooseby:{
            type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
            default: null
        },
        chooseDate:{
            type: Date,
            default: null
        },
        acceptstt:{
            type: String,
            default: 'Pending'
        },
        acceptDate:{
            type: Date,
            default: null
        },
        acceptby:{
            type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
            default: null
        },
    },
    scenario: {
        type: String,
        default: null
    },
    scenariobyparty2: {
        type: String,
        default: null
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: "Active"
    },
    hearing_details: [{
        hearing_summery: {
            type: String,
            default: null
        },
        hearing_date: {
            type: Date,
            default: null
        },
        list: [{
            caseAttendese: {
                type: String,
                default: null
            },
            remarkAelation: {
                type: String,
                default: null
            },
            selectParty: {
                type: String,
                default: null
            }
        }
        ],
        document_party_1: [{
            originalname: {
                type: String,
                default: null
            },
            filename: {
                type: String,
                default: null
            },
            size: {
                type: Number,
                default: null
            }
        }
        ],
        document_party_2: [{
            originalname: {
                type: String,
                default: null
            },
            filename: {
                type: String,
                default: null
            },
            size: {
                type: Number,
                default: null
            }
        }
        ],
    }],
    awardDetails: {
        givenby:{
            type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
            default: null
        },
        awardSummary: {
            type: String,
            default: null
        },
        winingParty: {
            type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile',
            default: null
        },
        winingPartyType: {
            type: String,
            default: null
        },
        awardDocumets: [{
            originalname: {
                type: String,
                default: null
            },
            filename: {
                type: String,
                default: null
            },
            size: {
                type: Number,
                default: null
            }
        }
        ],
        otherDocumets: [{
            originalname: {
                type: String,
                default: null
            },
            filename: {
                type: String,
                default: null
            },
            size: {
                type: Number,
                default: null
            }
        }
        ],
        awardDate: {
            type: Date,
            default: Date.now
        },
    },
    nexthearingDate: {
        type: Date,
        default: null
    },
    casestt :{
        type: String,
        default: "UNDERDISCUSSION"   
    },
    feesdetails1A1B:{
        party1fees:{
            type: Number,
            default: null 
        },
        party2fees:{
            type: Number,
            default: null
        },
        arbitrationfees:{
            type: Number,
            default: null
        },
        feesDate: {
            type: Date,
            default: null
        },
    },
    feesdetailsS2:{
        party1fees:{
            type: Number,
            default: 0 
        },
        party2fees:{
            type: Number,
            default: 0 
        },
        arbitrationfees:{
            type: Number,
            default: 0 
        },
        p1arbitratorFees:{
            type: Number,
            default: 0 
        },
        p2arbitratorFees:{
            type: Number,
            default: 0 
        }
    }
});
module.exports = mongoose.model('tbl_caseinvolve', caseinvolveSchema);