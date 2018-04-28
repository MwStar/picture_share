


  var multer = require("multer");
  var storage = multer.diskStorage({//储存在硬盘M盘
  destination: function (req, file, cb) {
    cb(null, '/learn/graduationProject/color_h/picture_share/uploads/images')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '_' + Date.parse(new Date()) + '_' + file.originalname )
  }
})
const limits ={
  /*fileSize:200 ,//文件最大长度
  fieldSize:102400 ,//值最大长度
  files:10,//文件最大数量*/
}

exports.uploads = multer({ storage: storage , limits: limits});
//var uploads = multer({ dest: 'uploads/' })//文件位置


//图片上传

exports.imgUpload = function (req, res, next) {
	var files = req.files;
    console.log(files);
    if (!files) {
        res.send({status:1,message:"上传失败"});
    } else {
    	let paths = [];
        let titles = [];
    	files.map((item)=>{
            paths.push(item.filename);
    		titles.push(item.originalname);
    	})
        res.send({status:0,message:"上传成功",data:{paths:paths,titles:titles}});
    }
}