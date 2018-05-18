var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.Types.ObjectId;

var PageViewSchema = new Schema({//浏览量
	user_id: { type: String },//浏览者id(如果是登录用户)
	user: { type: Boolean },//是否是用户
	count: { type: Number, default: 0 },//
	create_at: { type: Date, default: Date.now },
	update_at: { type: Date, default: Date.now },
});

PageViewSchema.index({ create_at: -1});

const PV = mongoose.model('PV', PageViewSchema);
module.exports = PV;