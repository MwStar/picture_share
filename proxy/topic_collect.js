var TopicCollect = require('../models').TopicCollect;
var _ = require('lodash')

//根据作者id,及图片id,查找图片
exports.getTopicCollect = function (userId, topicId, callback) {
  TopicCollect.findOne({user_id: userId, topic_id: topicId}, callback);
};

//根据收藏者id,查找图片
exports.getTopicCollectsByUserId = function (userId, callback) {
  TopicCollect.find({user_id: userId})
  				.populate('topic_id')
  				.exec(callback);
};

exports.newAndSave = function (userId, topicId, callback) {
	
  var topiccollect      = new TopicCollect();
  topiccollect.user_id  = userId;
  topiccollect.topic_id = topicId;
  topiccollect.save(callback);
};

exports.remove = function (userId, topicId, callback) {
  TopicCollect.remove({user_id: userId, topic_id: topicId}, callback);
};
