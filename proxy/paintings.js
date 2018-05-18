var models  = require('../models/index');
var Paintings  = models.Paintings;
var Topic = models.Topic;

/**
 * 根据画集ID获取画集
 * Callback:
 * - err, 数据库错误
 * - Paintings, 画集
 * @param {String} id 画集ID
 * @param {Function} callback 回调函数
 */
exports.getPaintingsById = function (id, callback) {

  Paintings.findOne({_id: id}, callback);
};


/**
 * 根据画集ID删除这个画集
 * Callback:
 * - err, 数据库错误
 * - Paintings, 画集
 * @param {String} id 画集ID
 * @param {Function} callback 回调函数
 */
exports.removePaintingsById = function (id, callback) {

  Paintings.remove({_id: id}, callback);
};


/**
 * 根据画集ID修改画集信息
 * Callback:
 * - err, 数据库错误
 * - Paintings, 画集
 * @param {String} id 画集ID
 * @param {Function} callback 回调函数
 */
exports.update = function (id, title, content, callback) {

  Paintings.update({ _id: id }, { $set: { title: title, content: content, }}, callback);
};


/**
 * 根据画集ID修改画集封面图
 * Callback:
 * - err, 数据库错误
 * - Paintings, 画集
 * @param {String} id 画集ID
 * @param {Function} callback 回调函数
 */
exports.updateCover = function (id, cover, callback) {

  Paintings.update({ _id: id }, { $set: { cover_path: cover}}, callback);
};

/**
 * 根据画集ID修改这个画集里图片topic(添加采集)
 * Callback:
 * - err, 数据库错误
 * - Paintings, 画集
 * @param {String} id 画集ID
 * @param {String} topic 要添加的图片id
 * @param {Function} callback 回调函数
 */
exports.updateTopic = function (id, topic, callback) {
  Paintings.findOne({_id: id},function(err,paintings){
    if (err) {
          return next(err);
        }
       if( !paintings.cover_path ){
       //如果没有设置画集封面
          Topic.findOne({_id: topic}, function (err,_topic) {
            
          Paintings.findByIdAndUpdate({ _id: id }, { $push: { topic: topic, }, $set:{ cover_path: _topic.path} }, callback);
          })
       }
       else{
        Paintings.findByIdAndUpdate({ _id: id }, { $push: { topic: topic, } }, callback);
       }
    
  })
};

/**
 * 根据画集ID修改这个画集里图片topic(刪除采集)
 * Callback:
 * - err, 数据库错误
 * - Paintings, 画集
 * @param {String} id 画集ID
 * @param {String} topic 要刪除采集的图片id
 * @param {Function} callback 回调函数
 */
exports.de_Topic = function (id, topic, callback) {
	Paintings.findOne({_id: id},function(err,paintings){
		if (err) {
          return next(err);
        }

       	Paintings.findByIdAndUpdate({ _id: id }, { $pop: { topic: topic, } }, callback);

  	
	})
};

/**
 * 根据画集ID修改这个画集里图片topic,若没有这个画集则新建这个画集
 * Callback:
 * - err, 数据库错误
 * - Paintings, 画集
 * @param {String} id 画集ID
 * @param {String} title 画集title
 * @param {String} content 画集描述
 * @param {String} topic 要添加的图片id
 * @param {Function} callback 回调函数
 */
exports.newOrupdateTopic = function (id, title, content, topic, callback) {

  	Paintings.findByIdAndUpdate({ _id: id }, { $push: { topic: topic, }}, callback);

};



/**
 * 根据用户ID获取所有画集
 * Callback:
 * - err, 数据库错误
 * - Paintings, 所有画集
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */
exports.getPaintingsByUserId = function (id, callback) {

  Paintings.find({author_id: id})
            .populate({path:'author',select:'avatar name'})
            .exec(callback)
};


/**
 * 获取画集列表数量
 * Callback:
 * - err, 数据库错误
 * @param {Function} callback 回调函数
 */
 exports.getCountByQuery = function (query, callback) {
  Paintings.count(query, callback);      
 }

 /**
 * 获取画集列表
 * Callback:
 * - err, 数据库错误
 * @param {Function} callback 回调函数
 */
 exports.getAll = function (page, callback) {
  if(page.pageNum === 1){
    Paintings.find()
              .populate({path:'author',select:'follower_count name avatar'})
              .limit(page.pageSize)
              .sort({'author.follower_count':-1})
              .exec(callback) 
  }
  else{
    Paintings.find()
              .populate({path:'author',select:'follower_count name avatar'})
              .skip((page.pageNum-1) * page.pageSize)
              .limit(page.pageSize)
              .sort({'author.follower_count':-1})
              .exec(callback) 
  }   
 }

exports.newAndSave = function (title, content, authorId, callback) {
  var paintings       = new Paintings();
  paintings.title     = title;
  paintings.content     = content;
  paintings.author_id = authorId;
  paintings.author = authorId;

  paintings.save(callback);
};

/**
 * 根据画集ID，删除画集
 * @param {String} id 画集ID
 * @param {Function} callback 回调函数
 */
exports.removePaintings = function (id, callback) {
  Paintings.remove({_id: id}, callback);
};