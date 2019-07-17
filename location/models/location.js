var mongoose = require("mongoose");


var LocationSchema = mongoose.Schema({
    c_id:{
       type:Number,
        default:0
    },
    country_name:{
        type:String,
        default:null        
     }, 
     country_code:{
        type:String,
        default:null        
     }, 
    phoneCode:{
      type:String,
        default:null 
    },
    status:{
        type:String,
        default:"active"
    },
    isdelete:{
        type:Number,
        default:0
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
    }

});

module.exports = mongoose.model('tbl_countrys',LocationSchema);
