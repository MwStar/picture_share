const mongoose = require('mongoose');
var utility   = require('utility');
var Schema    = mongoose.Schema;
var ObjectId  = Schema.Types.ObjectId;
// 创建schema
const userSchema = new mongoose.Schema({//用户
    loginname: {//用户名
    	type:String,
    	required:true,//设置是否必填
      index: true, //设定索引值
      unique: true, //索引值唯一
      default:'new user'
      //validate: [validateLocalStrategyProperty, '请填入用户名']//验证器函数
    },
    pass: {//密码
    	type:String,
/*    	required:true,*/
    	/*unique: true,*/
    },
    id: {type: Number,default: 0},//用户id
    userType:{type:String,default:'1'},//用户类型，1------用户 2-----管理员
    super:{type:Boolean,default:false},//超级管理员
    name:{type:String},//昵称
    email: { type: String},//邮箱
    url: { type: String },//用户的个人中心url地址
    profile_image_url: {type: String},//简介
    location: { type: String },//地址
    signature: { type: String },//签名
    weibo: { type: String },//微博
    avatar: { type: String ,default: ''},//头像
    topic: { type: Array },//用户采集的图片的id组成的数组
    //topic: { type: ObjectId, ref: 'Topic'},//关联topic

    paintings: {type: ObjectId, ref: 'Paintings' },//用户画集关联
    score: { type: Number, default: 0 },//积分
    img_count: { type: Number, default: 0 },//原创图片数量
    reply_count: { type: Number, default: 0 },//回复数量
    follower_count: { type: Number, default: 0 },//关注者数量
    paintings_count: { type: Number, default: 0 },//画集数量
    collect_img_count: { type: Number, default: 0 },//收藏(喜欢)图片数量
    gather_img_count: { type: Number, default: 0 },//采集图片数量
    create_at: { type: Date, default: Date.now },//创建日期
    update_at: { type: Date, default: Date.now },//更新日期
    is_star: { type: Boolean },//
    level: { type: String },//等级
    active: { type: Boolean, default: true },//是否激活邮箱

    retrieve_count: {type: Number},//检索次数
    retrieve_key: {type: String},//检索关键词

    accessToken: {type: String},//验证

    deleted: { type:Boolean, default: false},//是否被删除

})
//初始化对象时添加验证，验证传入的值是否合法
var validateLocalStrategyProperty = function (property) {
    return (!this.updated || property.length);
};
//查询类似数据
userSchema.methods.findByName = function(cb){
  return this.model('userModel').find({userName:this.userName},function(value){
  	console.log("value---"+value);
  })
}
//modal中可使用；创建该静态方法需要在创建完成schema之后，在Model编译之前：
userSchema.statics.findByName = function (name, callback) {
     this.find({ userName: name },callback);
   };


//虚拟属性，不储存在mongodb中，
//Gravatar是一图像跟随著您到访过的网站，当您在博客中留言或发表文章，它将会出现在您的名称旁。头像协助识别您在博客和论坛发表的文章
//头像，如果没有头像时
userSchema.virtual('avatar_url').get(function () {
  var url = this.avatar || ('https://gravatar.com/avatar/' + utility.md5(this.email.toLowerCase()) + '?size=48');

  // www.gravatar.com 被墙
  url = url.replace('www.gravatar.com', 'gravatar.com');

  // 让协议自适应 protocol，使用 `//` 开头
  if (url.indexOf('http:') === 0) {
    url = url.slice(5);
  }

  // 如果是 github 的头像，则限制大小
  if (url.indexOf('githubusercontent') !== -1) {
    url += '&s=120';
  }

  return url;
});

//定义二级索引。便于复合索引
userSchema.index({loginname: 1}, {unique: true});
userSchema.index({email: 1}, {unique: true});
userSchema.index({score: -1});
userSchema.index({accessToken: 1});

//错误处理，，如果任何中间件调用next或done与Error实例，流量被中断，并且错误被传递给回调
//在做save操作时
userSchema.pre('save', function(next){
  var now = new Date();
  this.update_at = now;
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;