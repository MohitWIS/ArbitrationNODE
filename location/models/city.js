var mongoose = require("mongoose");
var CitySchema = mongoose.Schema({

     country_id: { type: mongoose.Schema.Types.ObjectId, ref: 'location'}, 
     state_id: { type: mongoose.Schema.Types.ObjectId, ref: 'states'},

    city_name:{
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

module.exports = mongoose.model('cities',CitySchema);



