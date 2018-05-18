var mongoose  = require('mongoose');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.Types.ObjectId;

var DownloadSchema = new Schema({//下载
	user_id: { type: ObjectId },//下载者的id
	img_id: { type: ObjectId },//图片id
	create_at: { type: Date, default: Date.now },
});

DownloadSchema.index({img_id: 1, create_at: -1});

const Download = mongoose.model('Download', DownloadSchema);
module.exports = Download;