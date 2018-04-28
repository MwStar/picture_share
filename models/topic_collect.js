var mongoose  = require('mongoose');
//var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.Types.ObjectId;

var TopicCollectSchema = new Schema({//图片收藏
  user_id: { type: String },//收藏者的id
  topic_id: { type: ObjectId , ref: 'Topic'},//图片
  create_at: { type: Date, default: Date.now }
});

//TopicCollectSchema.plugin(BaseModel);
TopicCollectSchema.index({user_id: 1, topic_id: 1}, {unique: true});

const TopicCollect = mongoose.model('TopicCollect', TopicCollectSchema);
module.exports = TopicCollect;