var TopicCollect = require('../models').TopicCollect;
var _ = require('lodash')

//根据作者id,及画集id,查找画集
exports.getTopicCollect = function (userId, topicId, callback) {
  TopicCollect.findOne({user_id: userId, topic_id: topicId}, callback);
};

//根据作者id,查找画集
exports.getTopicCollectsByUserId = function (userId, opt, callback) {
  var defaultOpt = {sort: '-create_at'};
  opt = _.assign(defaultOpt, opt)
  TopicCollect.find({user_id: userId}, '', opt, callback);
};

exports.newAndSave = function (userId, topicId, callback) {
  var topic_collect      = new TopicCollect();
  topic_collect.user_id  = userId;
  topic_collect.topic_id = topicId;
  topic_collect.save(callback);
};

exports.remove = function (userId, topicId, callback) {
  TopicCollect.remove({user_id: userId, topic_id: topicId}, callback);
};
