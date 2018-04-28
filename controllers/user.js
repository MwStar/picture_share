var EventProxy   = require('eventproxy');
var Paintings = require('../proxy').Paintings;
var UserFollow = require('../proxy').UserFollow;
var Topic = require('../proxy').Topic;
var User = require('../proxy').User;
var authMiddleWare = require('../middlewares/auth');
var tools          = require('../common/tools');


//获取用户关注的人
/*参数:
	author_id----被关注者的id
返回：
*/
exports.getFocus = function(req, res, next){

	let id = '';
  
  if(req.query.id){
    id = req.query.id;
  }
  else{
    var decoded = authMiddleWare.verify_token(req.headers.authorization);
    id = decoded.iss;
  }

	UserFollow.getFollowerById(id, function(err,userfollow){
        if (err) {
          return next(err);
        }
        res.send({status: 0, message: "success", data:userfollow})
      })
}


//关注用户
/*参数:
	author_id----被关注者的id
返回：
*/
exports.follow = function(req, res, next){
	var author_id = req.query.id;//被关注人的id
	console.log("author_id----",author_id);
	//得到用户id
	var decoded = authMiddleWare.verify_token(req.headers.authorization);
	var id = decoded.iss;

	User.getUserById(author_id, function(err, user){
		if (err) {
	      return next(err);
	    }
	    if(!user){
	    	return res.send({status: 1, message: "没有该用户，关注失败"})
	    }

	    UserFollow.newAndSave(id, author_id, function(err,userfollow){
	        if (err) {
	          return next(err);
	        }
	        res.send({status: 0, message: "success"})
	    })
	    user.follower_count+=1;
	    user.save();
	})
}

//取消关注
/*参数:
	author_id----被关注者的id
返回：
*/
exports.delete_follow = function(req, res, next){
	var author_id = req.query.id;//被关注人的id
	console.log("author_id---",author_id);
	//得到用户id
	var decoded = authMiddleWare.verify_token(req.headers.authorization);
	var id = decoded.iss;
	User.getUserById(author_id, function(err, user){
		if (err) {
	      return next(err);
	    }
	    if(!user){
	    	return res.send({status: 1, message: "没有该用户，取消关注失败"})
	    }
		UserFollow.remove(id, author_id, function(err,userfollow){
	        if (err) {
	          return next(err);
	        }
	        res.send({status: 0, message: "success"})
	      })
		user.follower_count-=1;
	    user.save();
	})
}

//用户个人信息
/*参数:
	
返回：
*/
exports.index = function(req, res, next){

	let id = '';
  
	if(req.query.id){
	    id = req.query.id;
	}
	else{
	    var decoded = authMiddleWare.verify_token(req.headers.authorization);
	    id = decoded.iss;
	}

	User.getUserById(id, function(err, user){
		if (err) {
	      return next(err);
	    }
    	res.send({status:0, message:'success', data:user});
	})
}


//用户信息修改
/*参数:
	name----用户昵称
	email----用户邮箱
	signature----用户签名
返回：
*/
exports.setting = function(req, res, next){
	var name = req.body.name;
	var email = req.body.email;
	var signature = req.body.signature;
	//得到用户id
	var decoded = authMiddleWare.verify_token(req.headers.authorization);
	var id = decoded.iss;

	User.getUserById(id, function(err, user){
		if (err) {
	          return next(err);
	    }
		user.name = name;
		user.email = email;
		user.signature = signature;
		user.save(function (err) {
	        if (err) {
	          return next(err);
	        }
	        res.send({status:0, message:'修改信息成功'});
	    });
	})
}

//重新设置密码
/*参数:
	oldPasswd----用户旧密码
	newPasswd----用户新密码
返回：
*/
exports.pass_setting = function(req, res, next){
	var old_pass = req.body.oldPasswd;
	var new_pass = req.body.newPasswd;

	//得到用户id
	var decoded = authMiddleWare.verify_token(req.headers.authorization);
	var id = decoded.iss;

	User.getUserById(id, function(err, user){
		if (err) {
	          return next(err);
	    }
	    var passhash = user.pass;
	    tools.bcompare(old_pass, passhash, function (bool) {
	      if (!bool) {
	        return res.send({status:1, message:"旧密码不正确"});
	      }
	      //新密码加密
	      tools.bhash(new_pass, function (passhash) {      	
			user.pass = passhash;
			user.save(function (err) {
		        if (err) {
		          return next(err);
		        }
		        res.send({status:0, message:'修改密码成功'});
		    });
	      })

	  	})
	})
}

