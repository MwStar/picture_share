var mongoose  = require('mongoose');
//var BaseModel = require("./base_model");
var Schema    = mongoose.Schema;
var ObjectId  = Schema.Types.ObjectId;

var UserFollowSchema = new Schema({//关注摄影师
  user_id: { type: ObjectId , ref: 'User'},//关注人的id
  author_id: { type: ObjectId , ref: 'User'},//摄影师(被关注者)的id
  create_at: { type: Date, default: Date.now }
});

//TopicCollectSchema.plugin(BaseModel);
UserFollowSchema.index({user_id: 1, author_id: 1}, {unique: true});

const UserFollow = mongoose.model('UserFollow', UserFollowSchema);
module.exports = UserFollow;