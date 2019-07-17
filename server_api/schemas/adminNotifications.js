var mongoose = require("mongoose");
var adminNotificationSchema = mongoose.Schema({
	profileidby: { type: mongoose.Schema.Types.ObjectId, ref: 'tbl_profile'},
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
module.exports = mongoose.model('tbl_adminnotifications', adminNotificationSchema);