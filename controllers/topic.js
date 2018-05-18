var validator = require('validator');
var Path = require('path');
var tencentyoutuyun = require('tencentyoutuyun');
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

var conf  = tencentyoutuyun.conf;
var youtu = tencentyoutuyun.youtu;
// 设置开发者和应用信息, 请填写你在开放平台
var appid = config.tencent.appid;
var secretId = config.tencent.secretId;
var secretKey = config.tencent.secretKey;
var userid = '2397560398';

conf.setAppInfo(appid, secretId, secretKey, userid, 0)

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
      //标签
    youtu.imagetag('/learn/graduationProject/color_h/picture_share/uploads/images/'+path, function(data){
        console.log("imagetag:" + JSON.stringify(data.data.tags));
        JSON.stringify(data.data.tags).map((item)=>{
          if(item.tag_confidence >= 40){
            tag.push(item.tag_name);
          }
        })
    });
    console.log("allTag---",tag);
    //色情图像检测
    /*youtu.imageporn('/learn/graduationProject/color_h/picture_share/uploads/images/'+path, function(data){
        console.log("imageporn:" + JSON.stringify(data.data.tags));
    });*/
    //美食检测
    /*youtu.fooddetect('/learn/graduationProject/color_h/picture_share/uploads/images/'+path, function(data){
        console.log("fooddetect:" + JSON.stringify(data.data.food));
    });*/
    Topic.newAndSave(title, path ,tag, content, address , params , id, id, true, function (err, topic) {
      if (err) {
        return next(err);
      }

      //上传这张画的用户图片数量+1，积分+1
      User.updateTopic(id,topic._id, function(err, user){
        user.gather_img_count +=1;
        user.score += 1;
        user.img_count += 1;
        user.save();
      });

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

//用户下载某一张图片
exports.download = function (req, res, next) {
  const id = req.query.id;
  DownLoad.newAndSave(id,function(err,download){
    Topic.getFullTopic(id, function(err,topic){
      topic.download_count +=1;
      topic.save();
    })  
  })
}


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
  var ep = new EventProxy();
  ep.all('imgInfo','replyInfo', function(img, reply){
      res.send({status: 0, message: "success", data: {img,reply} });
  });
  Topic.getTopicById(id, function (err, topic){
    if(err){
      return next(err);
    }
    ep.emit('imgInfo', topic);
  })
  Reply.getRepliesByTopicId(id, function (err, reply){
    if(err){
      return next(err);
    }
    ep.emit('replyInfo', reply);
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
    User.updateTopic(id,picture_id, function(err, user){
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
          console.log("paintings----",paintings);
          if(paintings.topic.length <= 1 ){
            paintings.cover_path = '';
            paintings.save();
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
  const page = req.body.page;
  var ep = new EventProxy();
  ep.all('img','count', function(img, count){
      const newpage = {
        pageNum:page.pageNum,
        total:count,
        pageSize:page.pageSize,
      }
      res.send({status: 0, message: "success", data: {img,page:newpage} });
  });
  Topic.getAll({'deleted':false}, {'download_count':-1} , page, function(err,topic){
    if (err) {
          return next(err);
        }
        ep.emit('img', topic);
        //res.send({status: 0, message: "success", data: topic });
  })
  Topic.getCountByQuery({'deleted':false}, function(err, count){
    if (err) {
          return next(err);
        }
        ep.emit('count', count);
  })

}

//最新-----图片，根据图片create_at创建时间来排序
exports.getAllForNew = function (req, res, next) {
  const page = req.body.page;
  const query = req.body.query || {};
  const newQuery = {
    ...query,
    'deleted':false,
  }
  var ep = new EventProxy();
  ep.all('img','count', function(img, count){
      const newpage = {
        pageNum:page.pageNum,
        total:count,
        pageSize:page.pageSize,
      }
      res.send({status: 0, message: "success", data: {img,page:newpage} });
  });
  Topic.getAll(newQuery, {'create_at':-1}, page, function(err,topic){
    if (err) {
          return next(err);
        }
        ep.emit('img', topic);
        //res.send({status: 0, message: "success", data: topic });
  })
  Topic.getCountByQuery(newQuery, function(err, count){
    if (err) {
          return next(err);
        }
        ep.emit('count', count);
  })

}

//首页------搜索图片，根据download_count来排序
exports.getByQuery = function (req, res, next) {
  const page = req.body.page;
  const key = req.body.key;
  Topic.getTopicsByQuery(key, page, function(err,img){
    if (err) {
          return next(err);
        }
        const count = img.length;
        const newpage = {
          pageNum:page.pageNum,
          total:count,
          pageSize:page.pageSize,
        }
        res.send({status: 0, message: "success", data: {img,page:newpage} });
  })

}


//更新图片信息
exports.update = function (req, res, next) {
  var topic_id = req.body.id;
  var title   = req.body.title;
  var tag     = req.body.tag;
  var content = req.body.content;
  var address = req.body.address;
  var params = req.body.params;
  var old_p = req.body.old_p;
  var new_p = req.body.new_p;

  var ep = new EventProxy();
  ep.all('save', 'delete', 'add', function(save ,old, new_p){
      res.send({status: 0, message: "修改图片信息成功", });
  });

  //验证token,得到用户
  var decoded = authMiddleWare.verify_token(req.headers.authorization);
  var id = decoded.iss;

  Topic.getTopicById(topic_id, function (err, topic) {
    if (!topic) {
      res.send({status:1, message:'此图片不存在或已被删除。'});
      return;
    }
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
        ep.emit('save', {});
      });
      User.getUserById(id, function(err, user){
        if(user.userType === '1' || user.userType === '3'){
          if(old_p === new_p){
            ep.emit('delete', {});
            ep.emit('add', {});
          }
          else{

            Paintings.de_Topic(old_p, topic_id, function(err, paintings){
              if (err) {
                  return next(err);
                }
              ep.emit('delete', paintings);
            })

            Paintings.updateTopic(new_p, topic_id,function(err, paintings){
              if (err) {
                  return next(err);
                }
              ep.emit('add', paintings);
            })
          }
        }
        else{
          ep.emit('delete', {});
          ep.emit('add', {});
        }
      })

  });
};

//更新图片信息---只修改所属画集
exports.updatePaintings = function (req, res, next) {
  var topic_id = req.body.id;
  var old_p = req.body.old_p;
  var new_p = req.body.new_p;
  var ep = new EventProxy();
  ep.all('delete','add', function(old, new_p){
      res.send({status: 0, message: "修改图片所属画集成功", });
  });

  Topic.getTopicById(topic_id, function (err, topic) {
    if (!topic) {
      res.send({status:1, message:'此图片不存在或已被删除。'});
      return;
    }
    if(old_p === new_p){
        ep.emit('delete', {});
        ep.emit('add', {});
      }
    else{
      Paintings.de_Topic(old_p, function(err, paintings){
        if (err) {
            return next(err);
          }
        ep.emit('delete', paintings);
      })

      Paintings.updateTopic(new_p, function(err, paintings){
        if (err) {
            return next(err);
          }
        ep.emit('add', paintings);
      })
      
    }
  });
};

//删除图片，只有管理员有这个权限
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
     if(user.userType === '3'){

        user.score -= 5;
        user.topic_count -= 1;
        user.save();
     }

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
      return res.json({status: 1, message:"喜欢图片失败,这张图不存在"});
    }

    TopicCollect.getTopicCollect(id, topic._id, function (err, doc) {
      if (err) {
        return next(err);
      }
      if (doc) {
        res.json({status: 1, message:"不可再次喜欢"});
        return;
      }
      console.log("topic----",topic);
      TopicCollect.newAndSave(id, topic._id, function (err) {
        if (err) {
          return next(err);
        }
        res.json({status: 0, message:"喜欢图片成功"});
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

//得到未审核的图片
exports.getPictureNochecked = function (req, res, next) {
  const page = req.body.page;
  var ep = new EventProxy();
  ep.all('img','count', function(img, count){
      const newpage = {
        pageNum:page.pageNum,
        total:count,
        pageSize:page.pageSize,
      }
      res.send({status: 0, message: "success", data: {img,page:newpage} });
  });
  Topic.getAll({checked:false,check:false,status:false},'download_count', page, function(err,topic){
    if (err) {
          return next(err);
        }
        ep.emit('img', topic);
        //res.send({status: 0, message: "success", data: topic });
  })
  Topic.getCountByQuery({checked:false,check:false,status:false}, function(err, count){
    if (err) {
          return next(err);
        }
        ep.emit('count', count);
  })
};
//审核人工图片
exports.checked = function (req, res, next) {
  const id = req.body.id;
  const status = req.body.status;
  Topic.getById(id, function(err, topic){
    if(err){
      return next(err)
    }
    if(!topic){
      return res.send({status: 1, message: "此图片不存在", data: {} });
    }
    if(status === 1){
      topic.checked = true;
      topic.status = true;
      topic.save();
    }else{     
      topic.checked = false;//未通过审核
      topic.deleted = true;//删除
      topic.status = true;//已审核
      topic.save();
    }
    res.send({status: 0, message: "success", data: {} });
  })
};
//打标签
exports.doTag = function (req, res, next) {
  const id = req.body.id;
  const tag = req.body.tag;
  Topic.getById(id, function(err, topic){
    if(err){
      return next(err)
    }
    if(!topic){
      return res.send({status: 1, message: "此图片不存在", data: {} });
    }
      topic.tag = tag;
      topic.dotag = true;
      topic.save();
      res.send({status: 0, message: "success", data: {} });
  })
};

