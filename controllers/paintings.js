
var EventProxy   = require('eventproxy');
var Paintings = require('../proxy').Paintings;
var Topic = require('../proxy').Topic;
var User = require('../proxy').User;
var authMiddleWare = require('../middlewares/auth');

//创建画集
/*参数：title----画集名称
	content----画集描述
返回：画集id
*/
exports.create = function(req, res, next){
	var title = req.body.paintings_title;
	var content = req.body.paintings_content;
	//得到用户id
	var decoded = authMiddleWare.verify_token(req.headers.authorization);
	var id = decoded.iss;
	Paintings.newAndSave(title, content, id, function(err,paintings){
        if (err) {
          return next(err);
        }
        res.send({status: 0, message: "success", data: { id: paintings._id }})
      })
}

//某个画集基本信息（得到）get
/*参数：画集id
返回：某个画集信息对象(title,content)*/
exports.get = function(req, res, next){
  var paintings_id = req.query.id;
  console.log("paintings_id-----",paintings_id);
  Paintings.getPaintingsById(paintings_id, function(err,paintings){
        if (err) {
          return next(err);
        }
        res.send({status: 0, message: "success", data:{ title: paintings.title, content: paintings.content }})
      })
}

//某个画集基本信息（修改）post
/*参数：画集id
返回：某个画集信息对象(title,content)*/
exports.update = function(req, res, next){
  var id = req.body.id;
  var title = req.body.paintings_title;
	var content = req.body.paintings_content;

	Paintings.update(id, title, content, function(err,paintings){
        if (err) {
          return next(err);
        }
        res.send({status: 0, message: "success", data:{ }})
      })
}


//获取用户下所有画集
/*参数：用户id
返回：所有画集对象(title,content)*/
exports.getAll = function(req, res, next){

  let id = '';
  
  if(req.query.id){
    id = req.query.id;
  }
  else{
    var decoded = authMiddleWare.verify_token(req.headers.authorization);
    id = decoded.iss;
  }
	Paintings.getPaintingsByUserId(id, function(err,paintings){
        if (err) {
          return next(err);
        }
        res.send({status: 0, message: "success", data: paintings })
      })
}



//得到一个画集的所有图片
/*参数：id----画集id
返回：所有该画集所有图片
*/
exports.getById = function (req, res, next) {
  //画集id
  var paintings_id   = req.query.id;

  Paintings.getPaintingsById(paintings_id, function (err, paintings) {
    if (err) {
      return next(err);
    }
    var ep = new EventProxy();
    ep.after('got_topic', paintings.topic.length, function(list){
      //所有topic的内容都存在list数组中
      res.send({status: 0, message: "success", data: list });
    });
    if(paintings.topic.length > 0){
      for(let i = 0; i<paintings.topic.length; i++){
          Topic.getTopic(paintings.topic[i] , function(err,topic){
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
};


//发现-----所有原创画集，根据画集的作者的关注人数来排序
exports.getAllForSearch = function (req, res, next) {
  Paintings.getAll(function(err,paintings){
    if (err) {
          return next(err);
        }
        res.send({status: 0, message: "success", data: paintings });
  })

}