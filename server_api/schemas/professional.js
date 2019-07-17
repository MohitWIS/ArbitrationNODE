var mongoose = require('mongoose');

var professionalSchema = mongoose.Schema({
    loginid: {
       type: mongoose.Schema.Types.ObjectId, ref: 'tbl_login',
        default:null
    },
    workexperience:[
        {
            title: {
                type: String,
                default:null
            },
            organisation:{
                type:String,
                default:null
            },
            location:{
                type:String,
                default:null
            },
            from_month:{
                type:String,
                default:null
            },
            from_year:{
                type:String,
                default:null
            },
            to_month: {
                type: String,
                default:null
            },
            to_year: {
                type: String,
                default:null
            },
            currentlyworking: {
                type: Boolean,
                default:false
            },
            adddate: {
                type: Date,
             default: Date.now
            }   
        }
    ],
    description: {
        type: String,
        default:null
    },
    experience_erbitration: {
        type: String,
        default:null
    },
    areas_expertise: {
        type: String,
        default:null
    },
    total_Years_Working_Arbitration: {
        type: Number,
        default:0
    },
    functional_area_arbitration: {
        type: String,
        default:null
    },
    professional_publications: {
        type: String,
        default:null
    },
    membership_professional: {
        type: String,
        default:null
    },
    no_of_arbitration_awards: {
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
        default: "Active"
    }
});
var Admin = module.exports = mongoose.model('tbl_professional',professionalSchema);