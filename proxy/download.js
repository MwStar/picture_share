var models  = require('../models/index');
var Download  = models.Download;
var Topic      = models.Topic;


//全年下载量，以月为单位
exports.DownloadMonth = function (callback) {
	const now = new Date();
	const nowYear = now.getFullYear();//四位数年
	const start = new Date(nowYear,01,01);
  Download.aggregate([   
  		{   $match : { create_at : {$gt:start,$lte:now}}},  
        {   $project : { day : {$substr: ["$create_at", 0, 7] }}},          
        {   $group   : { _id : "$day",  number : { $sum : 1 }}},  
        {   $sort    : { _id : 1 }}          
   ],callback)
};
/*//一月下载量，以周为单位
exports.DownloadWeek = function (time, callback) {
  const weekTime = new Date( time.getTime() - 7 * 24 * 3600 * 1000);
  Download.count({create_at:{$gt:weekTime,$lte:time}},callback)//大于，小于等于
};*/
//一周,或一月下载量，以日为单位
exports.DownloadDay = function (time,callback) {
	const now = new Date();
	const nowDay = now.getDay();//一周的某一天，0-6
	const nowDate = now.getDate()-1;//一月的某一天，1-31
	const weekTime = new Date( now.getTime() - nowDay * 24 * 3600 * 1000);
	const monthTime = new Date( now.getTime() - nowDate * 24 * 3600 * 1000);
	let start = '';
	if(time === 1){start = weekTime}else{start = monthTime}
		console.log("start----",now,nowDay,start);
  Download.aggregate([   
  		{   $match : { create_at : {$gt:start,$lte:now}}},  
        {   $project : { day : {$substr: ["$create_at", 0, 10] }}},          
        {   $group   : { _id : "$day",  number : { $sum : 1 }}},  
        {   $sort    : { _id : 1 }}          
   ],callback)
};

//图片下载量排名
exports.DownloadRanking = function (callback) {
	Topic.find()
			.populate('author', 'avatar name')
			.sort('-download_count')
			.limit(10)
			.select('author download_count title path')
			.exec(callback)
};

//图片总下载量
exports.DownloadCount = function (callback) {
	Download.count({},callback);
};

exports.newAndSave = function ( img_id, callback) {
  var download         = new Download();
  download.img_id   = img_id;

  download.save(callback);
};