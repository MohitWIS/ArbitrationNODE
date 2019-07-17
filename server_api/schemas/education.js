var mongoose = require('mongoose');

var educationSchema = mongoose.Schema({
    loginid: {
       type: mongoose.Schema.Types.ObjectId, ref: 'tbl_login',
        default:null
    },
    educationaldetails : [
        {
            universitycollege: {
                type: String,
                default:null
            },
            degree:{
                type:String,
                default:null
            },
            field_of_study:{
                type:String,
                default:null
            },
            grade:{
                type:String,
                default:null
            },
            from_year:{
                type:String,
                default:null
            },
            to_year: {
                type: String,
                default:null
            },
            description: {
                type: String,
                default:null
            },
            adddate: {
                type: Date,
                default: Date.now
            }
        }
    ],
    achievement_societies: {
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
var Admin = module.exports = mongoose.model('tbl_education',educationSchema);