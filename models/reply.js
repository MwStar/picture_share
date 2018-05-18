var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.Types.ObjectId;

var ReplySchema = new Schema({//评论
  content: { type: String },//内容
  img_id: { type: ObjectId},//图片id
  author_id: { type: ObjectId ,ref: 'User'},//评论者id
  beReviewed_id: { type: ObjectId ,ref: 'User'},//被评论者id
  level: { type: String },//评论----1，回复----2，
  create_at: { type: Date, default: Date.now },
  update_at: { type: Date, default: Date.now },
  content_is_html: { type: Boolean },//内容是否是一个链接
  deleted: {type: Boolean, default: false},
});

ReplySchema.index({ create_at: -1});

const Reply = mongoose.model('Reply', ReplySchema);
module.exports = Reply;