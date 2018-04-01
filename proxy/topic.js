var EventProxy = require('eventproxy');//解决深度回调问题，并行处理
var models  = require('../models/index');
var Topic      = models.Topic;
var User       = require('./user');
var Reply      = require('./reply');
var tools      = require('../common/tools');
var at         = require('../common/at');
//var _          = require('lodash');//降低 array、number、objects、string 等等的使用难度从而让 JavaScript 变得更简单



//.assign/.all -----多类型异步协作。.assign方法同于.all，在所有操作执行完之后
//.after -------重复异步协作。.after在异步调用Topic_ready结束后，执行操作
//.fail -------侦听了error事件，默认处理卸载掉所有handler，并调用回调函数
//.done -------done方法除了接受事件名外，还接受回调函数。
		//如果是函数时，它将剔除第一个error对象(此时为null)后剩余的参数，传递给该回调函数作为参数
//

/**
 * 根据主题ID获取图片
 * Callback:
 * - err, 数据库错误
 * - Topic, 主题
 * - author, 作者
 * - lastReply, 最后回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getTopicById = function (id, callback) {
  var proxy = new EventProxy();
  var events = ['Topic', 'author', 'last_reply'];
  proxy.assign(events, function (Topic, author, last_reply) {
    if (!author) {
      return callback(null, null, null, null);
    }
    return callback(null, Topic, author, last_reply);
  }).fail(callback);

  Topic.findOne({_id: id}, proxy.done(function (Topic) {
    if (!Topic) {
      proxy.emit('Topic', null);
      proxy.emit('author', null);
      proxy.emit('last_reply', null);
      return;
    }
    proxy.emit('Topic', Topic);

    User.getUserById(Topic.author_id, proxy.done('author'));

    if (Topic.last_reply) {
      Reply.getReplyById(Topic.last_reply, proxy.done(function (last_reply) {
        proxy.emit('last_reply', last_reply);
      }));
    } else {
      proxy.emit('last_reply', null);
    }
  }));
};

/**
 * 获取关键词能搜索到的图片数量
 * Callback:
 * - err, 数据库错误
 * - count, 主题数量
 * @param {String} query 搜索关键词
 * @param {Function} callback 回调函数
 */
exports.getCountByQuery = function (query, callback) {
  Topic.count(query, callback);
};

/**
 * 根据关键词，获取图片列表
 * Callback:
 * - err, 数据库错误
 * - count, 主题列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
exports.getTopicsByQuery = function (query, opt, callback) {
  query.deleted = false;
  Topic.find(query, {}, opt, function (err, Topics) {
    if (err) {
      return callback(err);
    }
    if (Topics.length === 0) {
      return callback(null, []);
    }

    var proxy = new EventProxy();
    
    proxy.after('Topic_ready', Topics.length, function () {
      Topics = _.compact(Topics); // 删除不合规的 Topic
      return callback(null, Topics);
    });
    
    proxy.fail(callback);

    Topics.forEach(function (Topic, i) {
      var ep = new EventProxy();
      ep.all('author', 'reply', function (author, reply) {
        // 保证顺序
        // 作者可能已被删除
        if (author) {
          Topic.author = author;
          Topic.reply = reply;
        } else {
          Topics[i] = null;
        }
        proxy.emit('Topic_ready');
      });
      User.getUserById(Topic.author_id, ep.done('author'));
      // 获取主题的最后回复
      Reply.getReplyById(Topic.last_reply, ep.done('reply'));
    });
  });
};

// for sitemap
exports.getLimit5w = function (callback) {
  Topic.find({deleted: false}, '_id', {limit: 50000, sort: '-create_at'}, callback);
};

/**
 * 获取所有图片的分类
 * Callback:
 * - err, 数据库异常
 * - message, 消息
 * - Topic, 主题
 * - author, 主题作者
 * - replies, 主题的回复
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getFullTopic = function (id, callback) {
  var proxy = new EventProxy();
  var events = ['Topic', 'author', 'replies'];
  proxy
    .assign(events, function (Topic, author, replies) {
      callback(null, '', Topic, author, replies);
    })
    .fail(callback);

  Topic.findOne({_id: id, deleted: false}, proxy.done(function (Topic) {
    if (!Topic) {
      proxy.unbind();
      return callback(null, '此分类不存在或已被删除。');
    }
    at.linkUsers(Topic.content, proxy.done('Topic', function (str) {
      Topic.linkedContent = str;
      return Topic;
    }));

    User.getUserById(Topic.author_id, proxy.done(function (author) {
      if (!author) {
        proxy.unbind();
        return callback(null, '分类的作者丢了。');
      }
      proxy.emit('author', author);
    }));

    Reply.getRepliesByTopicId(Topic._id, proxy.done('replies'));
  }));
};

/**
 * 更新图片主题的最后回复信息
 * @param {String} TopicId 主题ID
 * @param {String} replyId 回复ID
 * @param {Function} callback 回调函数
 */
exports.updateLastReply = function (TopicId, replyId, callback) {
  Topic.findOne({_id: TopicId}, function (err, Topic) {
    if (err || !Topic) {
      return callback(err);
    }
    Topic.last_reply    = replyId;
    Topic.last_reply_at = new Date();
    Topic.reply_count += 1;
    Topic.save(callback);
  });
};

/**
 * 根据主题ID，查找一条主题
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.getTopic = function (id, callback) {
  Topic.findOne({_id: id}, callback);
};

/**
 * 将当前主题的回复计数减1，并且更新最后回复的用户，删除回复时用到
 * @param {String} id 主题ID
 * @param {Function} callback 回调函数
 */
exports.reduceCount = function (id, callback) {
  Topic.findOne({_id: id}, function (err, Topic) {
    if (err) {
      return callback(err);
    }

    if (!Topic) {
      return callback(new Error('该主题不存在'));
    }
    Topic.reply_count -= 1;

    Reply.getLastReplyByTopId(id, function (err, reply) {
      if (err) {
        return callback(err);
      }

      if (reply.length !== 0) {
        Topic.last_reply = reply[0]._id;
      } else {
        Topic.last_reply = null;
      }

      Topic.save(callback);
    });

  });
};

exports.newAndSave = function (title, path, content,tab, authorId, callback) {
  var Topic       = new Topic();
  Topic.title     = title;
  Topic.path   = path;
  Topic.content   = content;
  //Topic.tab       = tab;
  Topic.author_id = authorId;

  Topic.save(callback);
};