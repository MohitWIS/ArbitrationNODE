var mongoose = require("mongoose");
var NotificationSchema = mongoose.Schema({
	profileidby: { type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile'},
	profileidfor: { type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile'},
	caseId: { type: mongoose.Schema.Types.ObjectId, ref: 'tbl_case'},
	type:{
		type:String,
		default:null
	},
	desc:{
		type:String,
		default:null
	},
	seenstt:{
		type:Number,
		default:0
	},
	createdate:{
		type:Date,
		default:Date.now
	}
});
module.exports = mongoose.model('notifications', NotificationSchema);