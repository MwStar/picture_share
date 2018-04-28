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
  type: { type: String },
  master_id: { type: ObjectId},
  author_id: { type: ObjectId },//用户id
  img_id: { type: ObjectId },//图片id
  reply_id: { type: ObjectId },//回复者id
  has_read: { type: Boolean, default: false },//是否已读
  create_at: { type: Date, default: Date.now }
});

MessageSchema.index({master_id: 1, has_read: -1, create_at: -1});

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;