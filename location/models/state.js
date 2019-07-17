var mongoose = require("mongoose");
var StateSchema = mongoose.Schema({

     country_id: { type: mongoose.Schema.Types.ObjectId, ref: 'location'},
     s_id:{
        type:Number,
        default:0
     },
       state_name:{
                type:String,
                default:null
            },
    createby:{
        admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'admins', default:null},
        create_date:{
            type:Date,
            timezone: "Asia/Kolkata",
            default:null
        }
    },
    updateby:{
        admin_id: { type: mongoose.Schema.Types.ObjectId, ref: 'admins', default:null},
        update_date:{
            type:Date,
            timezone: "Asia/Kolkata",
            default:null
        }
    },
    status:{
        type:String,
        default:"active"
    },
    
    isdelete:{
        type:Number,
        default:0
    }

});

module.exports = mongoose.model('states',StateSchema);



