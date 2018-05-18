var models       = require('../models');
var eventproxy   = require('eventproxy');
var Message      = models.Message;
var User         = require('../proxy').User;
var messageProxy = require('../proxy/message');
var _            = require('lodash');

exports.sendReplyMessage = function ( author_id, img_id, reply_id, master_id, level, callback) {
  callback = callback || _.noop;
  var ep = new eventproxy();
  ep.fail(callback);

  var message       = new Message();
  message.type      = level;
  message.master_id = master_id;
  message.author_id = author_id;
  message.img_id  = img_id;
  message.reply_id  = reply_id;

  message.save(ep.done('message_saved'));
  ep.all('message_saved', function (msg) {
    callback(null, msg);
  });
};

exports.sendAtMessage = function ( author_id, master_id, callback) {
  callback = callback || _.noop;
  var ep = new eventproxy();
  ep.fail(callback);

  var message       = new Message();
  message.type      = '3';//表示关注
  message.master_id = master_id;
  message.author_id = author_id;
  //message.img_id  = img_id;
  //message.reply_id  = reply_id;

  message.save(ep.done('message_saved'));
  ep.all('message_saved', function (msg) {
    callback(null, msg);
  });
};