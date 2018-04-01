var mongoose = require('mongoose');
var config   = require('../units/config');

/*mongoose.connect(config.db, {
}, function (err) {
  if (err) {
    console.log('connect to %s error: ', config.db, err.message);
    process.exit(1);
  }
});*/

//const bcrypt = require('bcrypt-nodejs');
// 连接mongodb
mongoose.connect(config.db);
// 实例化连接对象
const db = mongoose.connection
//db.on('error', console.error.bind(console, '连接错误：'))
db.on('error', console.error.bind(console, '连接错误：'))
db.once('open', (callback) => {
  console.log('MongoDB连接成功！！')
})

// models
var User = require('./user');
var Topic = require('./topic');
var TopicCollect = require('./topic_collect');
var Reply = require('./reply');
var Message = require('./message');

exports.User = User;
exports.Topic = Topic;
exports.TopicCollect = TopicCollect;
exports.Reply = Reply;
exports.Message = Message;