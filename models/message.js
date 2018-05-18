var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.Types.ObjectId;

/*
 * type:
 * reply: xx 回复了你的话题
 * reply2: xx 在话题中回复了你
 * follow: xx 关注了你
 * at: xx ＠了你
 */

var MessageSchema = new Schema({//消息
  type: { type: String },//消息类型，，1---评论，2-----回复，3-----关注用户
  master_id: { type: ObjectId, ref:'User'},//做出这个行为的用户
  master: { type: ObjectId, ref:'User'},//做出这个行为的用户
  author_id: { type: ObjectId, ref:'User' },//用户id
  author: { type: ObjectId, ref:'User' },//用户id
  img_id: { type: ObjectId , ref: 'Topic'},//图片id
  img: { type: ObjectId , ref: 'Topic'},//图片id
  reply_id: { type: ObjectId , ref:'Reply'},//回复（内容）id
  reply: { type: ObjectId , ref:'Reply'},//回复（内容）id
  has_read: { type: Boolean, default: false },//是否已读
  create_at: { type: Date, default: Date.now }
});

MessageSchema.index({has_read: -1, create_at: -1});

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;