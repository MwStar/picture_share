const mongoose = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.Types.ObjectId;
var User = require('./user');
// 创建schema
const topicSchema = new mongoose.Schema({//图片
	//id: {type: Number,default: 0},//图片id
	title: { type: String },//图片名字
	path: { type:String },//图片存储路径
	content: {type:String},//内容，描述图片的内容
	tag: { type:Array },//图片标签
	main_color: { type:String },//图片主色
	theme_color: { type:Array },//图片主题色
	author: { type:ObjectId, ref: 'User' },//图片作者名字name字段，头像avatar字段
	author_id: { type:String },//图片作者id
	address: { type:String },//图片地址
	size: { type:String },//图片大小
	pixels: { type:String },//图片像素大小
	params: { type:Array },//图片参数（如光圈）

	check: {type:Boolean,default:false},//是否通过了优图审核
	status: {type:Boolean,default:false},//审核状态
	checked: {type:Boolean,default:false},//是否通过人工审核
	dotag: {type:Boolean,default:false},//是否通过人工打标签
	deleted: { type:Boolean, default: false},//是否被删除

	top: { type:Boolean,default:false },//图片是否被推荐
	visit_count: { type: Number, default: 0 },//图片浏览次数
  	collect_count: { type: Number, default: 0 },//图片收藏（喜欢）次数
  	collect_to: { type: Number, default: 0 },//图片被收藏到了哪些画集
  	download_count: { type: Number, default: 0 },//图片下载次数
  	gather_count: { type: Number, default: 0 },//图片采集次数
  	reply_count: { type: Number, default: 0 },//图片回复的数量
  	last_reply: { type: ObjectId, ref: 'Reply' },//回复
  	last_reply_at: { type: Date, default: Date.now },//最后一次回复时间

  	create_at: { type: Date, default: Date.now },//创建时间
 	update_at: { type: Date, default: Date.now },//更新时间

})

const Topic = mongoose.model('Topic', topicSchema);
module.exports = Topic;