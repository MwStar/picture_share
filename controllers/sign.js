var validator      = require('validator');
var eventproxy     = require('eventproxy');
var config         = require('../config');
var User           = require('../proxy').User;
var mail           = require('../common/mail');
var tools          = require('../common/tools');
var utility        = require('utility');
var authMiddleWare = require('../middlewares/auth');
var uuid           = require('node-uuid');

//sign up
/*exports.showSignup = function (req, res) {
  res.render('sign/signup');
};*/

//注册

exports.signup = function (req, res, next) {
  /*var loginname = validator.trim(req.body.name).toLowerCase();
  var email     = validator.trim(req.body.email).toLowerCase();
  var pass      = validator.trim(req.body.pass);
  var rePass    = validator.trim(req.body.re_pass);*/

  var loginname = req.body.name;
  var email     = req.body.email;
  var pass      = req.body.pass;
  var rePass    = req.body.re_pass;

  var ep = new eventproxy();
  ep.fail(next);
  ep.on('prop_err', function (msg) {
    res.send({status:1,message: msg, loginname: loginname, email: email});
  });

  // 验证信息的正确性
  if ([loginname, pass, rePass, email].some(function (item) { return item === ''; })) {
    ep.emit('prop_err', '信息不完整。');
    return;
  }
  if (loginname.length < 5) {
    ep.emit('prop_err', '用户名至少需要5个字符。');
    return;
  }
  if (!tools.validateId(loginname)) {
    return ep.emit('prop_err', '用户名不合法。');
  }
  if (!validator.isEmail(email)) {
    return ep.emit('prop_err', '邮箱不合法。');
  }
  if (pass !== rePass) {
    return ep.emit('prop_err', '两次密码输入不一致。');
  }
  // END 验证信息的正确性


  User.getUsersByQuery({'$or': [
    {'loginname': loginname},
    {'email': email}
  ]}, {}, function (err, users) {
    if (err) {
      return next(err);
    }
    if (users.length > 0) {
      ep.emit('prop_err', '用户名或邮箱已被使用。');
      return;
    }
    //密码加密
    tools.bhash(pass, ep.done(function (passhash) {
      // create gravatar生成头像
      //var avatarUrl = User.makeGravatar(email);
      User.newAndSave(loginname, loginname, passhash, email, false, function (err) {
        if (err) {
          return next(err);
        }
        // 发送激活邮件
        //utility.md5(email + passhash + config.session_secret)生成token
        mail.sendActiveMail(email, utility.md5(email + passhash + config.session_secret), loginname);
        res.send({
          status:0,
          message: '欢迎加入 ' + config.name + '！我们已给您的注册邮箱发送了一封邮件，请点击里面的链接来激活您的帐号。'
        });
      });

    }));


  });
};

/**
 * Show user login page.
 *
 * @param  {HttpRequest} req
 * @param  {HttpResponse} res
 */
/*exports.showLogin = function (req, res) {
  req.session._loginReferer = req.headers.referer;
  res.render('sign/signin');
};*/

/**
 * define some page when login just jump to the home page
 * @type {Array}
 */

/**
 * Handle user login.登录验证
 *
 * @param {HttpRequest} req
 * @param {HttpResponse} res
 * @param {Function} next
 */
exports.login = function (req, res, next) {
  var loginname = req.body.name;
  var pass      = req.body.pass;
  var ep        = new eventproxy();

  ep.fail(next);

  if (!loginname || !pass) {
    return res.send({ status:1, message: '信息不完整。' });
  }

  var getUser;
  if (loginname.indexOf('@') !== -1) {
    getUser = User.getUserByMail;
  } else {
    getUser = User.getUserByLoginName;
  }

  ep.on('login_error', function (login_error) {
    res.send({ status:1,message: '用户名或密码错误' });
  });

  getUser(loginname, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return ep.emit('login_error');
    }
    var passhash = user.pass;
    tools.bcompare(pass, passhash, ep.done(function (bool) {
      if (!bool) {
        return ep.emit('login_error');
      }
      if (!user.active) {
        // 重新发送激活邮件
        mail.sendActiveMail(user.email, utility.md5(user.email + passhash + config.session_secret), user.loginname);
        return res.send({ status:1 , message: '此帐号还没有被激活，激活链接已发送到 ' + user.email + ' 邮箱，请查收。' });
      }
      // store session cookie
      //authMiddleWare.gen_session(user, res);
      //check at some page just jump to home page
      /*var refer = req.session._loginReferer || '/';
      for (var i = 0, len = notJump.length; i !== len; ++i) {
        if (refer.indexOf(notJump[i]) >= 0) {
          refer = '/';
          break;
        }
      }*/
      //得到token
      var { token } = authMiddleWare.gen_token(user._id);
      return res.send({status:0,data:{userType:user.userType,token:token}});
    }));
  });
};


exports.activeAccount = function (req, res, next) {
  var key  = validator.trim(req.query.key);
  var name = validator.trim(req.query.name);

  User.getUserByLoginName(name, function (err, user) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return next(new Error('[ACTIVE_ACCOUNT] no such user: ' + name));
    }
    var passhash = user.pass;
    if (!user || utility.md5(user.email + passhash + config.session_secret) !== key) {
      return res.render('notify/notify', {error: '信息有误，帐号无法被激活。'});
    }
    if (user.active) {
      return res.render('notify/notify', {error: '帐号已经是激活状态。'});
    }
    user.active = true;
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      res.render('notify/notify', {success: '帐号已被激活，请登录'});
    });
  });
};

exports.showSearchPass = function (req, res) {
  res.render('sign/search_pass');
};

exports.updateSearchPass = function (req, res, next) {
  var email = validator.trim(req.body.email).toLowerCase();
  if (!validator.isEmail(email)) {
    return res.render('sign/search_pass', {error: '邮箱不合法', email: email});
  }

  // 动态生成retrive_key和timestamp到users collection,之后重置密码进行验证
  var retrieveKey  = uuid.v4();
  var retrieveTime = new Date().getTime();

  User.getUserByMail(email, function (err, user) {
    if (!user) {
      res.render('sign/search_pass', {error: '没有这个电子邮箱。', email: email});
      return;
    }
    user.retrieve_key = retrieveKey;
    user.retrieve_time = retrieveTime;
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      // 发送重置密码邮件
      mail.sendResetPassMail(email, retrieveKey, user.loginname);
      res.render('notify/notify', {success: '我们已给您填写的电子邮箱发送了一封邮件，请在24小时内点击里面的链接来重置密码。'});
    });
  });
};



exports.updatePass = function (req, res, next) {
  var psw   = validator.trim(req.body.psw) || '';
  var repsw = validator.trim(req.body.repsw) || '';
  var key   = validator.trim(req.body.key) || '';
  var name  = validator.trim(req.body.name) || '';

  var ep = new eventproxy();
  ep.fail(next);

  if (psw !== repsw) {
    return res.render('sign/reset', {name: name, key: key, error: '两次密码输入不一致。'});
  }
  User.getUserByNameAndKey(name, key, ep.done(function (user) {
    if (!user) {
      return res.render('notify/notify', {error: '错误的激活链接'});
    }
    tools.bhash(psw, ep.done(function (passhash) {
      user.pass          = passhash;
      user.retrieve_key  = null;
      user.retrieve_time = null;
      user.active        = true; // 用户激活

      user.save(function (err) {
        if (err) {
          return next(err);
        }
        return res.render('notify/notify', {success: '你的密码已重置。'});
      });
    }));
  }));
};