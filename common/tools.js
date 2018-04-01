var bcrypt = require('bcryptjs');//加密
var moment = require('moment');//时间格式化
var SALT_WORK_FACTOR = 10;
moment.locale('zh-cn'); // 使用中文

// 格式化时间
exports.formatDate = function (date, friendly) {
  date = moment(date);

  if (friendly) {
    return date.fromNow();
  } else {
    return date.format('YYYY-MM-DD HH:mm');
  }

};

exports.validateId = function (str) {
  return (/^[a-zA-Z0-9\-_]+$/i).test(str);
};

exports.bhash = function (str, callback) {
	bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
        if (err) return next(err);
  		bcrypt.hash(str, salt, callback);
	})
};

exports.bcompare = function (str, hash, callback) {
  bcrypt.compare(str, hash, callback);
};