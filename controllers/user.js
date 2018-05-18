var EventProxy   = require('eventproxy');
var Paintings = require('../proxy').Paintings;
var UserFollow = require('../proxy').UserFollow;
var Topic = require('../proxy').Topic;
var User = require('../proxy').User;
var DownLoad = require('../proxy').DownLoad;
var PV = require('../proxy').PV;
var authMiddleWare = require('../middlewares/auth');
var tools          = require('../common/tools');
var message        = require('../common/message');
var mail           = require('../common/mail');
var utility        = require('utility');
var config         = require('../config');


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
	    UserFollow.getByAllId(id,author_id, function(err,follow){
	    	if(follow){
	    		return res.send({status: 1, message: "已关注该用户"})
	    	}
	    	else{

			    UserFollow.newAndSave(id, author_id, function(err,userfollow){
			        if (err) {
			          return next(err);
			        }
			        res.send({status: 0, message: "success"})

			        //关注的消息
					  message.sendAtMessage(author_id, id, function(err, message){
					    if (err) {
					          return next(err);
					        }
					  })
			    })
			    user.follower_count+=1;
			    user.save();
	    	}
	    })
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
	var ep        = new EventProxy();
	//得到用户id
	var decoded = authMiddleWare.verify_token(req.headers.authorization);
	var id = decoded.iss;
	ep.on('check_error', function (check_error) {
	    res.send({ status:1,message: check_error });
	  });
	User.getUserById(id, function(err, user){
		if (err) {
	          return next(err);
	    }
	    var passhash = user.pass;
	    tools.bcompare(old_pass, passhash, ep.done(function (bool) {
	      if (!bool) {
	      	console.log("不匹配");
	      	return ep.emit('check_error','旧密码不正确');
	      }
	  	//新密码加密
	      tools.bhash(new_pass, ep.done(function (passhash) {	
			user.pass = passhash;
			user.save(function (err) {
		        if (err) {
		          return next(err);
		        }
		        res.send({status:0, message:'修改密码成功'});
		    });
	      }));
	  	}));

	})
}


//以下为管理端的接口

//得到统计数
/*参数:
	
返回：
*/
exports.count = function(req, res, next){
	var ep = new EventProxy();
	ep.all('userCount','topicCount','downCount','pvCount', 'ranking', function(user, picture, down, pageview, ranking){
    	res.send({status: 0, message: "success", data: {user,picture,down,pageview,ranking} });
	});
	User.getAllCount(function(err,userCount){
		if (err) {
		          return next(err);
		        }
		let admin = 0;
		let user = 0;
		userCount.map((item)=>{
			if(item._id === '1'){user = item.count;}
				if(item._id === '2'){admin = item.count;}
		})
		let all = admin+user;
		let value = {
			all:all,
			user:user,
			admin:admin
		}
		ep.emit('userCount', value);
	});
	Topic.getAllCount(function(err,topicCount){
		if (err) {
		          return next(err);
		        }
		let checked = 0;
		let unchecked = 0;
		topicCount.map((item)=>{
			if(item._id === true){checked = item.count;}
				if(item._id === false){unchecked = item.count;}
		})
		let all = checked+unchecked;
		let value = {
			all:all,
			checked:checked,
			unchecked:unchecked
		}
		ep.emit('topicCount', value);
	});
	PV.getAllCount(function(err, pvCount){
		if (err) {
		          return next(err);
		        }
		let login = 0;
		let unlogged = 0;
		pvCount.map((item)=>{
			if(item._id === true){login = item.count;}
				if(item._id === false){unlogged = item.count;}
		})
		let all = login+unlogged;
		let value = {
			all:all,
			login:login,
			unlogged:unlogged
		}
		ep.emit('pvCount', value);
	})
	DownLoad.DownloadCount(function(err, downCount){
		if (err) {
		          return next(err);
		        }
		ep.emit('downCount', downCount);
	});
	DownLoad.DownloadRanking(function(err, ranking){
		if (err) {
		          return next(err);
		        }
		ep.emit('ranking', ranking);
	});
}

//得到具体下载量分析
/*参数:
	
返回：
*/
exports.downloadCount = function(req, res, next){
	const time = req.body.time;
	//const date = req.body.date;
	console.log('time---',time);
	switch(time){
		case 1:
			DownLoad.DownloadDay(time , function(err,count){
				res.send({status:0,message:'success',data:count});
			});
			break;
		case 2:
			DownLoad.DownloadDay(time, function(err,weekcount){
				res.send({status:0,message:'success',data:weekcount});
			});
			break;
		case 3:
			DownLoad.DownloadMonth(function(err,weekcount){
				res.send({status:0,message:'success',data:weekcount});
			});
			break;
		default:res.send({status:0,message:'success'});
	}

}

//网站浏览量
/*参数:
	
返回：
*/
exports.pv = function(req, res, next){
	const user = req.query.user;
	console.log('user----',user);
	//验证token,得到用户
	if(user === 'true'){
	  	var decoded = authMiddleWare.verify_token(req.headers.authorization);
	  	var id = decoded.iss;
		PV.getPVById(id, function(err,pageview){
			if (err) {
	          return next(err);
	    	}
	    	if(!pageview){
	    		PV.newAndSave(true, id, function(err,pv){
	    			console.log("有用户pv----",pv);
	    		})
	    	}
	    	else{
	    		console.log("有用户且已有记录----");
	    		pageview.count+=1;
	    		pageview.save();
	    	}
	    	res.send({status:0,message:'success'});
		})
	}
	else{
		PV.newAndSave(false, '', function(err,pv){
	    			console.log("无用户pv----",pv);
	    			res.send({status:0,message:'success'});
	    		})
	}

}

//所有用户
/*参数:
	
返回：
*/
exports.getusers = function(req, res, next){
	const page = req.body.page;
	const query = req.body.query;
	var ep = new EventProxy();
	ep.all('user','count', function(user, count){
		const newpage = {
		pageNum:page.pageNum,
		total:count,
		pageSize:page.pageSize,
	}
	res.send({status: 0, message: "success", data: {user,page:newpage} });
	});
	User.getUsersPaging(query, page, function(err,topic){
	if (err) {
	  return next(err);
	}
	ep.emit('user', topic);
	//res.send({status: 0, message: "success", data: topic });
	})
	User.getCount(query, function(err, count){
	if (err) {
	  return next(err);
	}
	ep.emit('count', count);
	})

}

//新增管理员,用户，摄影师
/*参数:
	
返回：
*/
exports.add = function(req, res, next){
	const userType = req.body.userType;
	const loginname = req.body.loginname;
	const pass = req.body.pass;
	const email = req.body.email;
	var ep = new EventProxy();
 	ep.fail(next);
	tools.bhash(pass, ep.done(function (passhash) {
		User.newUser(userType, loginname, passhash, email,function(err,user){
			if (err) {
		          return next(err);
		    }
		    res.send({status:0,message:'success',data:{}});
		})
		
	}));

}

//删除用户
/*参数:
	
返回：
*/
exports.deleteUser = function(req, res, next){
	const user_id = req.query.id;
	User.getUserById(user_id, function(err, user){
		if (err) {
		          return next(err);
		    }
		user.deleted = true;
		user.save();
		res.send({status:0,message:'success',data:{}});
	})	

}

//重置密码
exports.resetPass = function(req, res, next){
	const user_id = req.query.id;
	let pass = '111111';
	var ep = new EventProxy();
 	ep.fail(next);
	User.getUserById(user_id, function(err, user){
		if (err) {
		          return next(err);
		    }
		 //密码加密
	    tools.bhash(pass, ep.done(function (passhash) {
			user.pass = passhash;
			user.save();
			// 发送重置密码邮件
        	mail.sendResetPassMail(user.email, utility.md5(user.email + passhash + config.session_secret), user.loginname);
			res.send({status:0,message:'success',data:{}});
	    }));
	})	

}

//用户信息修改

exports.updateUserInfo = function(req, res, next){

	var email = req.body.email;
	var pass = req.body.pass;
	var userType = req.body.userType;
	var id = req.body.id;
	var ep = new EventProxy();
 	ep.fail(next);
	User.getUserById(id, function(err, user){
		if (err) {
	          return next(err);
	    }
	    tools.bhash(pass, ep.done(function (passhash) {
			user.email = email;
			user.pass = passhash;		
			user.userType = userType;
			user.save(function (err) {
		        if (err) {
		          return next(err);
		        }
		        res.send({status:0, message:'修改信息成功'});
		    });

	    }));
	})
}
