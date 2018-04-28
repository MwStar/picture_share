var UserFollow = require('../models').UserFollow;
var _ = require('lodash')

//根据关注人id,查找他所关注的人
exports.getFollowerById = function (userId, callback) {
  UserFollow.find({user_id: userId})
  				.populate('author_id','name signature avatar img_count paintings_count')
        		.exec(callback)

};


exports.newAndSave = function (userId, authorId, callback) {
  var userfollow      = new UserFollow();
  userfollow.user_id  = userId;
  userfollow.author_id = authorId;
  userfollow.save(callback);
};

exports.remove = function (userId, authorId, callback) {
  UserFollow.remove({user_id: userId, author_id: authorId}, callback);
};
