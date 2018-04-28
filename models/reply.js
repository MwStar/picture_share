var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.Types.ObjectId;

var ReplySchema = new Schema({//评论
  content: { type: String },//内容
  img_id: { type: ObjectId},//图片id
  author_id: { type: ObjectId },//评论者id
  reply_id: { type: ObjectId },//回复者id
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  content_is_html: { type: Boolean },//内容是否是一个链接
  ups: [Schema.Types.ObjectId],
  deleted: {type: Boolean, default: false},
});

ReplySchema.index({topic_id: 1});
ReplySchema.index({author_id: 1, create_at: -1});

const Reply = mongoose.model('Reply', ReplySchema);
module.exports = Reply;