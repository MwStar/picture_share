var models  = require('../models/index');
var User    = models.User;
//MD5校验
var utility = require('utility');
//创建唯一标识符，便于寻找，关联
var uuid    = require('node-uuid');

/**
 * 根据用户名列表查找用户列表
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Array} names 用户名列表
 * @param {Function} callback 回调函数
 */
exports.getUserByLoginName = function (names, callback) {
  if (names.length === 0) {
    return callback(null, []);
  }
  User.findOne({ loginname: { $in: names } }, callback);
};

/**
 * 根据昵称查找用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} name 昵称
 * @param {Function} callback 回调函数
 */
exports.getUserByName = function (name, callback) {
  User.findOne({'name': new RegExp('^'+name+'$', "i")}, callback);
};

/**
 * 根据用户ID，查找用户（一个）
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} id 用户ID
 * @param {Function} callback 回调函数
 */
exports.getUserById = function (id, callback) {
  if (!id) {
    return callback();
  }
  User.findOne({_id: id}, callback);
};

/**
 * 根据邮箱，查找用户(一个)
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} email 邮箱地址
 * @param {Function} callback 回调函数
 */
exports.getUserByMail = function (email, callback) {
  User.findOne({email: email}, callback);
};

/**
 * 根据用户ID列表，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Array} ids 用户ID列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByIds = function (ids, callback) {
  User.find({'_id': {'$in': ids}}, callback);
};

/**
 * 根据关键字，获取一组用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {String} query 关键字
 * @param {Object} opt 选项
 * @param {Function} callback 回调函数
 */
exports.getUsersByQuery = function (query, opt, callback) {
  User.find(query, '', opt, callback);
};

/**
 * 获取一组用户,并分页
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Object} query 搜索条件
 * @param {Object} page 分页信息
 * @param {Function} callback 回调函数
 */
exports.getUsersPaging = function (query, page, callback) {
  if(page.pageNum === 1){
    User.find(query)
        .limit(page.pageSize)
        .sort({"create_at":-1})
        .exec(callback);
  }
  else{    
    User.find(query)
          .skip((page.pageNum-1) * page.pageSize)
          .limit(page.pageSize)
          .sort({"create_at":-1})
          .exec(callback);
  }
};

/**
 * 根据查询条件，获取一个用户
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} name 用户名
 * @param {String} key 激活码
 * @param {Function} callback 回调函数
 */
exports.getUserByNameAndKey = function (loginname, key, callback) {
  User.findOne({loginname: loginname, retrieve_key: key}, callback);
};

/**
 * 采集画时，向topic字段push
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} topic 画id
 * @param {Function} callback 回调函数
 */
exports.updateTopic = function (id, topic, callback) {
  User.findByIdAndUpdate({ _id: id }, { $push: { topic: topic, } }, callback);
};

/**
 * 删除采集画时，向topic字段pop
 * Callback:
 * - err, 数据库异常
 * - user, 用户
 * @param {String} topic 画id
 * @param {Function} callback 回调函数
 */
exports.de_Topic = function (id, topic, callback) {
  User.findByIdAndUpdate({ _id: id }, { $pop: { topic: topic, } }, callback);
};

/**
 * 得到所有用户数量----根据userType来分组
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Function} callback 回调函数
 */
exports.getAllCount = function (callback) {
  User.aggregate([

　　{$group:{_id:"$userType",count:{$sum:1},}}

  ],callback);
};

/**
 * 得到所有用户数量-----不分组
 * @param {Object} query 搜索条件
 * Callback:
 * - err, 数据库异常
 * - count, 数量
 * @param {Function} callback 回调函数
 */
exports.getCount = function (query, callback) {
  User.count(query,callback);
};

exports.newAndSave = function (name, loginname, pass, email, active, callback) {
  var user         = new User();
  user.name        = name;
  user.loginname   = loginname;
  user.pass        = pass;
  user.email       = email;
  user.active      = active || false;
  user.accessToken = uuid.v4();

  user.save(callback);
};

exports.newUser = function (userType, loginname, pass, email, callback) {
  console.log("info----",loginname,pass,email);
  var user         = new User();
  user.userType   = userType;
  user.loginname   = loginname;
  user.name        = loginname;
  user.pass        = pass;
  user.email       = email;
  user.active      = true;
  user.save(callback);
};
//生成头像
var makeGravatar = function (email) {
  return 'http://www.gravatar.com/avatar/' + utility.md5(email.toLowerCase()) + '?size=48';
};
exports.makeGravatar = makeGravatar;

exports.getGravatar = function (user) {
  return user.avatar || makeGravatar(user);
};