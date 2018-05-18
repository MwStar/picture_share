var models  = require('../models/index');
var PV  = models.PV;



//根据id得到一个访问量
exports.getPVById = function (id, callback) {
	PV.findOne({ user_id: id },callback);
};

//得到所有访问量
exports.getAllPV = function ( callback ) {
	PV.find()
		.exec(callback);
};
//得到所有访问量数量
exports.getAllCount = function ( callback ) {
	PV.aggregate([

　　{$group:{_id:"$user",count:{$sum:"$count"}}}

  ],callback);
};


exports.newAndSave = function ( user, user_id, callback) {
  var pageview         = new PV();
  pageview.user = user,
  pageview.user_id = user_id,
  pageview.count = 1,
  pageview.save(callback);
};