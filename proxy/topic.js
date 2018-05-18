var EventProxy = require('eventproxy');//解决深度回调问题，并行处理
var models  = require('../models/index');
var Topic      = models.Topic;
var Download      = models.Download;
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
 * 根据图片ID获取图片
 * Callback:
 * - err, 数据库错误
 * - Topic, 主题
 * - author, 作者
 * - lastReply, 最后回复
 * @param {String} id 图片ID
 * @param {Function} callback 回调函数
 */
exports.getTopicById = function (id, callback) {

  /*Topic.findOne({_id: id}, function (err,topic) {
    if (err) {
      return callback(err);
    }
    if(topic.reply_count){
      console.log('有评论');
      Reply.getRepliesByTopicId(topic._id, function (err, reply){
        const newTopic = {...topic,...reply};
        return callback(newTopic);
      })
    }
    else{
      console.log('无评论',topic);
      return callback(topic);
    }
  });*/
  Topic.findOne({_id: id})
        .populate('author','name avatar')
        .exec(callback);
};
//根据id一张图片
exports.getById = function (id, callback) {
  Topic.findOne({_id: id})
        .exec(callback);
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



//所有图片数量,分为已审核，未审核
exports.getAllCount = function ( callback) {
  Topic.aggregate([

　　{$group:{_id:"$checked",count:{$sum:1}}}

  ],callback);
};

//所有图片下载量
exports.getDownloadCount = function ( callback) {
  Topic.aggregate([

　　{$group:{_id:"",total:{$sum:"$download_count"}}}

  ],callback);
};
/**
 * 获取所有图片列表,根据sort排序
 * Callback:
 * - err, 数据库错误
 * @param {String} key 搜索关键词
 * @param {Function} callback 回调函数
 .populate({path:'User',select:'avatar name'})
 */
 exports.getAll = function (query, sort, page, callback) {
  if(page.pageNum === 1){
    Topic.find(query)
        .populate('author', 'avatar name')
        .limit(page.pageSize)
        .sort(sort)
        .exec(callback);
  }
  else{    
    Topic.find(query)
          .populate('author', 'avatar name')
          .skip((page.pageNum-1) * page.pageSize)
          .limit(page.pageSize)
          .sort(sort)
          .exec(callback);
  }
      
 }


 /**
 * 根据关键词，获取图片列表，根据download_count排序
 * Callback:
 * - err, 数据库错误
 * @param {String} key 搜索关键词
 * @param {Function} callback 回调函数
 */
 exports.getTopicsByQuery = function (key, page, callback) {
  if(page.pageNum === 1){
    Topic.find({
          $or: [
            {'title': key},//$i忽略大小写
            {'tag': {'$in': [key]}},
            {'theme_color': {'$in': [key]}},
            ],
          'deleted':false,
        })
        .populate({path:'author',select:'avatar name download_count', options: {sort: { download_count: -1 }}})
        
        .limit(page.pageSize)
        .exec(callback);
  }
  else{
    Topic.find({
          $or: [
            {'title': key},//$i忽略大小写
            {'tag': {'$in': [key]}},
            {'theme_color': {'$in': [key]}},
            ]
        })
        .populate({path:'author',select:'avatar name download_count', options: {sort: { download_count: -1 }}})
        .skip((page.pageNum-1) * page.pageSize)
        .sort({"download_count":-1})
        .limit(page.pageSize)
        .exec(callback);
  }
      
 }
/**
 * 根据关键词，获取图片列表
 * Callback:
 * - err, 数据库错误
 * - count, 主题列表
 * @param {String} query 搜索关键词
 * @param {Object} opt 搜索选项
 * @param {Function} callback 回调函数
 */
/*exports.getTopicsByQuery = function (query, opt, callback) {
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
};*/

// for sitemap
exports.getLimit5w = function (callback) {
  Topic.find({deleted: false}, '_id', {limit: 50000, sort: '-create_at'}, callback);
};

/**
 * 根据id获取图片
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
  if (!id) {
    return callback();
  }
  Topic.findOne({_id: id}, callback);
}


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
 * 根据图片ID，查找一张图片
 * @param {String} id 图片ID
 * @param {Function} callback 回调函数
 */
exports.getTopic = function (id, callback) {
  Topic.findOne({_id: id})
        .populate('author','name avatar')
        .exec(callback);
};

/**
 * 根据图片ID，删除一张图片
 * @param {String} id 图片ID
 * @param {Function} callback 回调函数
 */
exports.removeTopic = function (id, callback) {
  Topic.remove({_id: id}, callback);
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

exports.newAndSave = function (title, path, tag, content, address , params ,author , authorId, checked, callback) {
  var topic       = new Topic();
  topic.title     = title;
  topic.path     = path;
  topic.tag   = tag;
  topic.content   = content;
  topic.address   = address;
  topic.params   = params;
  //Topic.tab       = tab;
  topic.author = author;
  topic.author_id = authorId;
  topic.checked = checked;
  topic.check = checked;
  topic.status = checked;

  topic.save(callback);
};