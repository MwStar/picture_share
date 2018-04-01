var mongoose  = require('mongoose');
//var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.ObjectId;

var TopicCollectSchema = new Schema({//画集
  user_id: { type: ObjectId },//画集作者id
  topic_id: { type: ObjectId },//
  create_at: { type: Date, default: Date.now }
});

//TopicCollectSchema.plugin(BaseModel);
TopicCollectSchema.index({user_id: 1, topic_id: 1}, {unique: true});

const TopicCollect = mongoose.model('TopicCollect', TopicCollectSchema);
module.exports = TopicCollect;