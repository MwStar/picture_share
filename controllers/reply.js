
var at           = require('../common/at');
var User         = require('../proxy').User;
var Topic        = require('../proxy').Topic;
var DownLoad        = require('../proxy').DownLoad;
var Paintings = require('../proxy').Paintings;
var TopicCollect = require('../proxy').TopicCollect;
var Reply = require('../proxy').Reply;
var EventProxy   = require('eventproxy');
var tools        = require('../common/tools');
var message        = require('../common/message');
var config       = require('../config');
//var _            = require('lodash');
//var cache        = require('../common/cache');
var logger = require('../common/logger');
var authMiddleWare = require('../middlewares/auth');

//评论图片
exports.comment = function (req, res, next) {
  const imgId = req.body.imgId;//图片id
  const id = req.body.id;//图片作者id,被评论者
  const level = req.body.level;//评论1/回复2
  const content = req.body.content;//评论内容
  //得到评论者id
  var decoded = authMiddleWare.verify_token(req.headers.authorization);
  var authorId = decoded.iss;
  Reply.newAndSave(content, imgId, authorId, id, level, function(err,reply){
    if (err) {
          return next(err);
        }
        res.send({status: 0, message: "success" });
  	  //回复的消息
  	  message.sendReplyMessage(id, imgId, reply._id, authorId, level, function(err, message){
  	    if (err) {
  	          return next(err);
  	        }
  	  })
      
  })

}

//删除评论
exports.de_comment = function (req, res, next) {
  const id = req.query.id;//评论id
  Reply.getReply(id, function(err, reply){
    reply.deleted = true;
    reply.save();
    res.send({status:0, message:"success"})
  })

}
