var validator = require('validator');

var at           = require('../common/at');
var User         = require('../proxy').User;
var Topic        = require('../proxy').Topic;
var Paintings = require('../proxy').Paintings;
var TopicCollect = require('../proxy').TopicCollect;
var EventProxy   = require('eventproxy');
var tools        = require('../common/tools');
var store        = require('../common/store');
var config       = require('../config');
//var _            = require('lodash');
//var cache        = require('../common/cache');
var logger = require('../common/logger');
var authMiddleWare = require('../middlewares/auth');

/**
 * Topic page
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 * @param  {Function} next
 */
/*exports.index = function (req, res, next) {
  function isUped(user, reply) {
    if (!reply.ups) {
      return false;
    }
    return reply.ups.indexOf(user._id) !== -1;
  }

  var topic_id = req.params.tid;
  var currentUser = req.session.user;

  if (topic_id.length !== 24) {
    return res.render404('此话题不存在或已被删除。');
  }
  var events = ['topic', 'other_topics', 'no_reply_topics', 'is_collect'];
  var ep = EventProxy.create(events,
    function (topic, other_topics, no_reply_topics, is_collect) {
    res.render('topic/index', {
      topic: topic,
      author_other_topics: other_topics,
      no_reply_topics: no_reply_topics,
      is_uped: isUped,
      is_collect: is_collect,
    });
  });

  ep.fail(next);

  Topic.getFullTopic(topic_id, ep.done(function (message, topic, author, replies) {
    if (message) {
      logger.error('getFullTopic error topic_id: ' + topic_id)
      return res.renderError(message);
    }

    topic.visit_count += 1;
    topic.save();

    topic.author  = author;
    topic.replies = replies;

    // 点赞数排名第三的回答，它的点赞数就是阈值
    topic.reply_up_threshold = (function () {
      var allUpCount = replies.map(function (reply) {
        return reply.ups && reply.ups.length || 0;
      });
      allUpCount = _.sortBy(allUpCount, Number).reverse();

      var threshold = allUpCount[2] || 0;
      if (threshold < 3) {
        threshold = 3;
      }
      return threshold;
    })();

    ep.emit('topic', topic);

    // get other_topics
    var options = { limit: 5, sort: '-last_reply_at'};
    var query = { author_id: topic.author_id, _id: { '$nin': [ topic._id ] } };
    Topic.getTopicsByQuery(query, options, ep.done('other_topics'));

    // get no_reply_topics
    cache.get('no_reply_topics', ep.done(function (no_reply_topics) {
      if (no_reply_topics) {
        ep.emit('no_reply_topics', no_reply_topics);
      } else {
        Topic.getTopicsByQuery(
          { reply_count: 0, tab: {$nin: ['job', 'dev']}},
          { limit: 5, sort: '-create_at'},
          ep.done('no_reply_topics', function (no_reply_topics) {
            cache.set('no_reply_topics', no_reply_topics, 60 * 1);
            return no_reply_topics;
          }));
      }
    }));
  }));

  if (!currentUser) {
    ep.emit('is_collect', null);
  } else {
    TopicCollect.getTopicCollect(currentUser._id, topic_id, ep.done('is_collect'))
  }
};*/

//上传一张图片
exports.put = function (req, res, next) {
  //图片参数参数
  var title   = req.body.title;
  var path   = req.body.path;
  var tag     = req.body.tag;
  var content = req.body.content;
  var address = req.body.address;
  var params = req.body.params;

  //画集参数
  var paintings_title = req.body.paintings_title;//新建
  var paintings_content = req.body.paintings_content;//新建
  var paintings_id = req.body.paintings_id;//已有
  //验证token,得到用户
  var decoded = authMiddleWare.verify_token(req.headers.authorization);
  var id = decoded.iss;

  User.getUserById(id, function (err,user) {
    if (err) {
          return next(err);
        }

    Topic.newAndSave(title, path ,tag, content, address , params , id, id, function (err, topic) {
      if (err) {
        return next(err);
      }

      //上传这张画的用户图片数量+1，积分+1

        user.score += 1;
        user.img_count += 1;
        user.save();


      //将画放入一个画集
      if(paintings_title){//新建:画集title，画集的描述，用户id
        Paintings.newAndSave(paintings_title, paintings_content, id, function(err,paintings){
          if (err) {
            return next(err);
          }
          Paintings.updateTopic(paintings._id, topic._id, function(err,_paintings){
            if (err) {
              return next(err);
            }
            res.send({status: 0, message: "success", data:{ id: paintings._id }})
          })
        })
      }
      else{//已有:画集的id,这幅画的id
        Paintings.updateTopic(paintings_id, topic._id, function(err,paintings){
          if (err) {
            return next(err);
          }
          res.send({status: 0, message: "success", data:{ id: paintings._id }})
        })

      }
      
      //发送at消息
      //at.sendMessageToMentionUsers(content, topic._id, req.session.user._id);
    });
  });
};

//得到用户下所有采集的图片
exports.getAll = function (req, res, next) {
  let id = '';
  
  if(req.query.id){
    id = req.query.id;
  }
  else{
    var decoded = authMiddleWare.verify_token(req.headers.authorization);
    id = decoded.iss;
  }

  User.getUserById(id, function (err, user) {
    if (err) {
      return next(err);
    }
    var ep = new EventProxy();
    ep.after('got_topic', user.topic.length, function(list){
      //所有topic的内容都存在list数组中
      res.send({status: 0, message: "success", data: list });
    });
    if(user.topic.length > 0){
      for(let i = 0; i<user.topic.length; i++){
          Topic.getTopic(user.topic[i] , function(err,topic){
            if (err) {
              return next(err);
            }
            ep.emit('got_topic', topic);
          })
      }
    }
    else{
      ep.emit('got_topic', []);
    }
    


  });

}

//得到用户下所有收藏的图片
exports.getCollect = function (req, res, next) {

  let id = '';
  
  if(req.query.id){
    id = req.query.id;
  }
  else{
    var decoded = authMiddleWare.verify_token(req.headers.authorization);
    id = decoded.iss;
  }

  TopicCollect.getTopicCollectsByUserId(id, function(err,topic){
    res.send({status:0, message:"success", data:topic})
  })

}

//得到一张图片的信息
exports.getInfo = function (req, res, next) {
  const id = req.query.id;
  Topic.getTopicById(id, function (err, topic){
    if(err){
      return next(err);
    }
    res.send({status:0, message:"success", data:topic});
  })
}


//采集图片到画集
exports.putToPaintings = function (req, res, next) {
  const picture_id = req.body.picture_id;//图片id
  const paintings_id = req.body.paintings_id;//画集id

  var decoded = authMiddleWare.verify_token(req.headers.authorization);
  var id = decoded.iss;
  User.getUserById(id, function (err, user) {
    if (err) {
      return next(err);
    }

    Paintings.updateTopic(paintings_id, picture_id, function(err,paintings){
          if (err) {
            return next(err);
          }
          res.send({status: 0, message: "success", data:{ }});
        })
    User.updateTopic(picture_id, function(err, user){
        user.gather_img_count +=1;
        user.save();
    })

    Topic.getTopicById(picture_id, function(err, topic){
        topic.gather_count +=1;
        topic.save();
    })

  })
}

//删除采集
exports.de_gatherPicture = function (req, res, next) {
  const picture_id = req.body.picture_id;//图片id
  const paintings_id = req.body.paintings_id;//画集id

  var decoded = authMiddleWare.verify_token(req.headers.authorization);
  var id = decoded.iss;

  User.getUserById(id, function (err, user) {
    if (err) {
      return next(err);
    }
    Paintings.de_Topic(paintings_id, picture_id, function(err,paintings){
          if (err) {
            return next(err);
          }
          if(!paintings){
            return res.send({status: 1, message: "画集里没有这张图"});
          }
          res.send({status: 0, message: "success", data:{ }});
        })
    User.de_Topic(picture_id, function(err, user){
        user.gather_img_count -=1;
        user.save();
    })

    Topic.getTopicById(picture_id, function(err, topic){
        topic.gather_count -=1;
        topic.save();
    })
  })
}

//首页------所有图片，根据download_count来排序
exports.getAllForIndex = function (req, res, next) {
  Topic.getAll('download_count', function(err,topic){
    if (err) {
          return next(err);
        }
        res.send({status: 0, message: "success", data: topic });
  })

}

//最新-----图片，根据图片create_at创建时间来排序
exports.getAllForNew = function (req, res, next) {
  Topic.getAll('create_at', function(err,topic){
    if (err) {
          return next(err);
        }
        res.send({status: 0, message: "success", data: topic });
  })

}

//首页------搜索图片，根据download_count来排序
exports.getByQuery = function (req, res, next) {
  const key = req.body.key;
  Topic.getTopicsByQuery(key, function(err,topic){
    if (err) {
          return next(err);
        }
        res.send({status: 0, message: "success", data: topic });
  })

}



exports.showEdit = function (req, res, next) {
  var topic_id = req.params.tid;

  Topic.getTopicById(topic_id, function (err, topic, tags) {
    if (!topic) {
      res.render404('此话题不存在或已被删除。');
      return;
    }

    if (String(topic.author_id) === String(req.session.user._id) || req.session.user.is_admin) {
      res.render('topic/edit', {
        action: 'edit',
        topic_id: topic._id,
        title: topic.title,
        content: topic.content,
        tab: topic.tab,
        tabs: config.tabs
      });
    } else {
      res.renderError('对不起，你不能编辑此话题。', 403);
    }
  });
};

//更新图片信息
exports.update = function (req, res, next) {

  var topic_id   = req.body.id;
  var title   = req.body.title;
  var tag     = req.body.tag;
  var content = req.body.content;
  var address = req.body.address;
  var params = req.body.params;

  //验证token,得到用户
  var decoded = authMiddleWare.verify_token(req.headers.authorization);
  var id = decoded.iss;

  Topic.getTopicById(topic_id, function (err, topic) {
    if (!topic) {
      res.send({status:1, message:'此图片不存在或已被删除。'});
      return;
    }

    if (topic.author_id === id) {

      //保存图片
      topic.title     = title;
      topic.tag     = tag;
      topic.content   = content;
      topic.address       = address;
      topic.params       = params;
      topic.update_at = new Date();

      topic.save(function (err) {
        if (err) {
          return next(err);
        }
        res.send({status:0, message:'修改图片信息成功'});
      });
    } else {
      res.send({status:1, message:'对不起，你不能修改此图片信息。'});
    }
  });
};

//删除图片，只有摄影师有这个权限
exports.delete = function (req, res, next) {
  //删除话题, 话题作者topic_count减1
  //删除回复，回复作者reply_count减1
  //删除topic_collect，用户collect_topic_count减1

  var topic_id = req.query.id;
  console.log("id----",topic_id);
//验证token,得到用户
  var decoded = authMiddleWare.verify_token(req.headers.authorization);
  var id = decoded.iss;

  Topic.getFullTopic(topic_id, function (err, topic) {
    if (err) {
      return res.send({ status: 1, message: err.message });
    }
    console.log('topic---',topic);
    if(!topic){
      return res.send({ status: 1, message: "此图片不存在或已被删除" });
    }
    User.getUserById(id, function(err, user){
      if (err) {
        return next(err);
      }
      console.log("user-----",user);
      if(!user){
        return res.send({status:1, message: '用户账号存在问题，请重新登陆'});
      }
      if (user.userType === '1') {
        return res.send({status:1, message: '无权限'});
      }
     
      user.score -= 5;
      user.topic_count -= 1;
      user.save();

    })
    topic.deleted = true;
    topic.save(function (err) {
      if (err) {
        return res.send({status:1, message: err.message });
      }
      res.send({ status:0, message: '图片已被删除。' });
    });
  });
};

// 设为置顶
exports.top = function (req, res, next) {
  var topic_id = req.params.tid;
  var referer  = req.get('referer');

  if (topic_id.length !== 24) {
    res.render404('此话题不存在或已被删除。');
    return;
  }
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.render404('此话题不存在或已被删除。');
      return;
    }
    topic.top = !topic.top;
    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = topic.top ? '此话题已置顶。' : '此话题已取消置顶。';
      res.render('notify/notify', {success: msg, referer: referer});
    });
  });
};

// 设为精华
exports.good = function (req, res, next) {
  var topicId = req.params.tid;
  var referer = req.get('referer');

  Topic.getTopic(topicId, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.render404('此话题不存在或已被删除。');
      return;
    }
    topic.good = !topic.good;
    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = topic.good ? '此话题已加精。' : '此话题已取消加精。';
      res.render('notify/notify', {success: msg, referer: referer});
    });
  });
};

// 锁定主题，不可再回复
exports.lock = function (req, res, next) {
  var topicId = req.params.tid;
  var referer = req.get('referer');
  Topic.getTopic(topicId, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.render404('此话题不存在或已被删除。');
      return;
    }
    topic.lock = !topic.lock;
    topic.save(function (err) {
      if (err) {
        return next(err);
      }
      var msg = topic.lock ? '此话题已锁定。' : '此话题已取消锁定。';
      res.render('notify/notify', {success: msg, referer: referer});
    });
  });
};

// 收藏(喜欢)图片
exports.collect = function (req, res, next) {
  const topic_id = req.query.id;
  //得到用户id
  const decoded = authMiddleWare.verify_token(req.headers.authorization);
  const id = decoded.iss;

  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      return res.json({status: 1, message:"收藏图片失败,这张图不存在"});
    }

    TopicCollect.getTopicCollect(id, topic._id, function (err, doc) {
      if (err) {
        return next(err);
      }
      if (doc) {
        res.json({status: 1, message:"不可再次收藏"});
        return;
      }
      console.log("topic----",topic);
      TopicCollect.newAndSave(id, topic._id, function (err) {
        if (err) {
          return next(err);
        }
        res.json({status: 0, message:"收藏图片成功"});
      });
      User.getUserById(id, function (err, user) {
        if (err) {
          return next(err);
        }
        user.collect_img_count += 1;
        user.save();
      });
      topic.collect_count += 1;
      topic.save();
    });
  });
};

//取消收藏
exports.de_collect = function (req, res, next) {
  var topic_id = req.query.id;
  //得到用户id
  const decoded = authMiddleWare.verify_token(req.headers.authorization);
  const id = decoded.iss;
  Topic.getTopic(topic_id, function (err, topic) {
    if (err) {
      return next(err);
    }
    if (!topic) {
      res.json({status: 1, message:"取消收藏失败,这张图不存在"});
    }
    TopicCollect.remove(id, topic._id, function (err, removeResult) {
      if (err) {
        return next(err);
      }
      console.log("removeResult---",removeResult);
      if (removeResult.ok == 0) {
        return res.json({status: 1, message:"取消收藏失败"})
      }

      User.getUserById(id, function (err, user) {
        if (err) {
          return next(err);
        }
        user.collect_img_count -= 1;
        user.save();
      });

      topic.collect_count -= 1;
      topic.save();

      res.json({status: 0, message:"success"});
    });
  });
};

exports.upload = function (req, res, next) {
  var isFileLimit = false;
  req.busboy.on('file', function (fieldname, file, filename, encoding, mimetype) {
      file.on('limit', function () {
        isFileLimit = true;

        res.json({
          success: false,
          msg: 'File size too large. Max is ' + config.file_limit
        })
      });

      store.upload(file, {filename: filename}, function (err, result) {
        if (err) {
          return next(err);
        }
        if (isFileLimit) {
          return;
        }
        res.json({
          success: true,
          url: result.url,
        });
      });

    });

  req.pipe(req.busboy);
};