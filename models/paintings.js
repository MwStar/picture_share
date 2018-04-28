const mongoose = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.Types.ObjectId;
// 创建schema
const paintingsSchema = new mongoose.Schema({//画集
	//id: { type: Number,default: 0 },//画集id
	author_id: { type: ObjectId },//创建这个画集的作者id
	author: { type: ObjectId, ref: 'User' },//创建这个画集的作者的关注人数量,昵称（嵌套查询得到）
	title: { type: String },//画集名字
	content: { type: String },//画集描述
	cover_path: { type: String },//画集封面图，topic不为空，则默认是第一张图
	topic: { type: Array },//画集里面的画，，数组里储存画的id
	original: { type: Boolean},//是否是原创画集，只有摄影师角色可以创建原创画集

  	create_at: { type: Date, default: Date.now },//创建时间
 	update_at: { type: Date, default: Date.now },//更新时间

})

const Paintngs = mongoose.model('Paintngs', paintingsSchema);
module.exports = Paintngs;