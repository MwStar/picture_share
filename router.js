/*!
 * nodeclub - route.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */


var express = require('express');
var sign = require('./controllers/sign');
var paintings = require('./controllers/paintings');
var upload = require('./controllers/upload');
var auth = require('./middlewares/auth');
var topic = require('./controllers/topic');
var user = require('./controllers/user');
var reply = require('./controllers/reply');
var message = require('./controllers/message');
/*var site = require('./controllers/site');
var user = require('./controllers/user');
var message = require('./controllers/message');
var topic = require('./controllers/topic');
var reply = require('./controllers/reply');
var rss = require('./controllers/rss');
var staticController = require('./controllers/static');
var auth = require('./middlewares/auth');
var limit = require('./middlewares/limit');
var github = require('./controllers/github');
var search = require('./controllers/search');
var passport = require('passport');
var configMiddleware = require('./middlewares/conf');
var config = require('./config');*/

var router = express.Router();

/*// home page
router.get('/', site.index);
// sitemap
router.get('/sitemap.xml', site.sitemap);
// mobile app download
router.get('/app/download', site.appDownload);

// sign controller
if (config.allow_sign_up) {
  router.get('/signup', sign.showSignup);  // 跳转到注册页面
  router.post('/signup', sign.signup);  // 提交注册信息
} else {
  // 进行github验证
  router.get('/signup', function (req, res, next) {
    return res.redirect('/auth/github')
  });
}
router.post('/signout', sign.signout);  // 登出
router.get('/signin', sign.showLogin);  // 进入登录页面
router.post('/signin', sign.login);  // 登录校验
router.get('/active_account', sign.activeAccount);  //帐号激活

router.get('/search_pass', sign.showSearchPass);  // 找回密码页面
router.post('/search_pass', sign.updateSearchPass);  // 更新密码
router.get('/reset_pass', sign.resetPass);  // 进入重置密码页面
router.post('/reset_pass', sign.updatePass);  // 更新密码

// user controller
router.get('/user/:name', user.index); // 用户个人主页
router.get('/setting', auth.userRequired, user.showSetting); // 用户个人设置页
router.post('/setting', auth.userRequired, user.setting); // 提交个人信息设置
router.get('/stars', user.listStars); // 显示所有达人列表页
router.get('/users/top100', user.top100);  // 显示积分前一百用户页
router.get('/user/:name/collections', user.listCollectedTopics);  // 用户收藏的所有话题页
router.get('/user/:name/topics', user.listTopics);  // 用户发布的所有话题页
router.get('/user/:name/replies', user.listReplies);  // 用户参与的所有回复页
router.post('/user/set_star', auth.adminRequired, user.toggleStar); // 把某用户设为达人
router.post('/user/cancel_star', auth.adminRequired, user.toggleStar);  // 取消某用户的达人身份
router.post('/user/:name/block', auth.adminRequired, user.block);  // 禁言某用户
router.post('/user/:name/delete_all', auth.adminRequired, user.deleteAll);  // 删除某用户所有发言

// message controler
router.get('/my/messages', auth.userRequired, message.index); // 用户个人的所有消息页

// topic

// 新建文章界面
router.get('/topic/create', auth.userRequired, topic.create);

router.get('/topic/:tid', topic.index);  // 显示某个话题
router.post('/topic/:tid/top', auth.adminRequired, topic.top);  // 将某话题置顶
router.post('/topic/:tid/good', auth.adminRequired, topic.good); // 将某话题加精
router.get('/topic/:tid/edit', auth.userRequired, topic.showEdit);  // 编辑某话题
router.post('/topic/:tid/lock', auth.adminRequired, topic.lock); // 锁定主题，不能再回复

router.post('/topic/:tid/delete', auth.userRequired, topic.delete);

// 保存新建的文章
router.post('/topic/create', auth.userRequired, limit.peruserperday('create_topic', config.create_post_per_day, {showJson: false}), topic.put);

router.post('/topic/:tid/edit', auth.userRequired, topic.update);
router.post('/topic/collect', auth.userRequired, topic.collect); // 关注某话题
router.post('/topic/de_collect', auth.userRequired, topic.de_collect); // 取消关注某话题

// reply controller
router.post('/:topic_id/reply', auth.userRequired, limit.peruserperday('create_reply', config.create_reply_per_day, {showJson: false}), reply.add); // 提交一级回复
router.get('/reply/:reply_id/edit', auth.userRequired, reply.showEdit); // 修改自己的评论页
router.post('/reply/:reply_id/edit', auth.userRequired, reply.update); // 修改某评论
router.post('/reply/:reply_id/delete', auth.userRequired, reply.delete); // 删除某评论
router.post('/reply/:reply_id/up', auth.userRequired, reply.up); // 为评论点赞
router.post('/upload', auth.userRequired, topic.upload); //上传图片

// static
router.get('/about', staticController.about);
router.get('/faq', staticController.faq);
router.get('/getstart', staticController.getstart);
router.get('/robots.txt', staticController.robots);
router.get('/api', staticController.api);

//rss
router.get('/rss', rss.index);

// github oauth
router.get('/auth/github', configMiddleware.github, passport.authenticate('github'));
router.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/signin' }),
  github.callback);
router.get('/auth/github/new', github.new);
router.post('/auth/github/create', limit.peripperday('create_user_per_ip', config.create_user_per_ip, {showJson: false}), github.create);

router.get('/search', search.index);

if (!config.debug) { // 这个兼容破坏了不少测试
	router.get('/:name', function (req, res) {
	  res.redirect('/user/' + req.params.name)
	})
}*/

//注册登录
router.post('/user/signup', sign.signup);  // 提交注册信息
router.post('/user/login', sign.login);  // 提交登录信息
router.get('/active_account', sign.activeAccount);  //帐号激活


//画集操作
//router.post('/imgUpload', uploads.single('image'), upload.imgUpload);  //文件(图片)上传
router.post('/imgUpload', auth.userRequired, upload.uploads.array('image', 6), upload.imgUpload);  //文件(图片)上传,多文件
router.post('/createPainting', auth.userRequired, paintings.create);  //创建画集
router.get('/de_Painting', auth.userRequired, paintings.delete);  //删除画集
router.get('/paintingInfo', paintings.get);  //画集基本信息（得到）
router.post('/updatePaintingInfo', auth.userRequired, paintings.update);  //画集基本信息（修改）
router.get('/getAllPaintings', paintings.getAll);  //获取用户下所有画集
router.get('/getPictureUnderPainting', paintings.getById);  //获取某个画集所有图片

//画操作
router.post('/uploadAndAddTopaintings', auth.userRequired, topic.put);  //上传图片之后保存到数据库并对图片归类画集
router.post('/gatherPicture', auth.userRequired, topic.putToPaintings);  //采集图片到画集
router.post('/de_gatherPicture', auth.userRequired, topic.de_gatherPicture);  //刪除采集
router.get('/getImgInfo', topic.getInfo);  //得到一张图片信息
router.get('/getAllPicture', topic.getAll);  //得到用户下所有采集的图片
router.get('/getPictureCollect', topic.getCollect);  //得到用户下所有收藏的图片
router.get('/getFocus', user.getFocus);  //得到用户下关注的人
router.get('/deletePicture', auth.userRequired, topic.delete);  //删除一张图片
router.post('/updatePicture', auth.userRequired, topic.update);  //更新一张图片信息
router.post('/updatePictureToPaintings', auth.userRequired, topic.updatePaintings);  //更新一张图片信息---只修改所属画集


//首页及发现最新
router.post('/getAllList', topic.getAllForIndex);  //首页------所有图片，根据download_count来排序
router.post('/getListByQuery', topic.getByQuery);  //首页------搜索图片，根据download_count来排序
router.post('/getAllListByAuthor', paintings.getAllForSearch);  //发现-----所有画集，根据画集作者的关注者来排序
router.post('/getAllListByTime', topic.getAllForNew);  //最新-----图片，根据图片create_at创建时间来排序
router.get('/collect', auth.userRequired, topic.collect);  //收藏图片
router.get('/de_collect', auth.userRequired, topic.de_collect);  //取消收藏图片

//用户行为
router.get('/follow', auth.userRequired, user.follow);  //关注用户
router.get('/de_follow', auth.userRequired, user.delete_follow);  //取消关注用户
router.get('/userInfo', user.index); // 获取用户基本信息
router.post('/setting', auth.userRequired, user.setting); // 个人信息设置
router.post('/pass_setting', auth.userRequired, user.pass_setting); // 修改密码
router.get('/download', topic.download); // 下载图片
router.post('/comment', auth.userRequired, reply.comment); // 评论
router.get('/de_comment', auth.userRequired, reply.de_comment); // 删除评论
router.get('/message', auth.userRequired, message.index); // 得到所有已读，未读消息
router.get('/message_hasread', auth.userRequired, message.read); // 将消息设置为已读
router.post('/allmessage_hasread', auth.userRequired, message.allread); // 将所有消息设置为已读


//后台
router.get('/count', auth.userRequired, user.count);  //得到图片统计数，用户数，下载量
router.post('/downloadCount', auth.userRequired, user.downloadCount);  //得到图片统计数，用户数，下载量
router.get('/pageView', user.pv);  //浏览量
router.post('/users', user.getusers);  //所有用户
router.post('/addUser', user.add);  //新增用户
router.get('/deleteUser', user.deleteUser);  //删除用户
router.get('/resetPass', user.resetPass);  //重置密码
router.post('/updateUser', user.updateUserInfo);  //更新用户
router.post('/getPictureNochecked', topic.getPictureNochecked);  //得到未审核的所有图片
router.post('/checked', topic.checked);  //审核
router.post('/doTag', topic.doTag);  //打标签



module.exports = router;