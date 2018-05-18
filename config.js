/**
 * config
 */

var path = require('path');

var config = {
  // debug 为 true 时，用于本地调试,不发送邮件
  debug: false,

  get mini_assets() { return !this.debug; }, // 是否启用静态文件的合并压缩，详见视图中的Loader

  name: 'Colorful', // 社区名字
  description: 'Colorful：多彩的图片分享网站', // 社区的描述
  keywords: 'img, color, share',

  
  // cdn host，如 http://cnodejs.qiniudn.com
  site_static_host: '/img_dev', // 静态文件存储域名
  // 社区的域名
  host: 'localhost',

  // mongodb 配置
  db: 'mongodb://localhost:27017/imgdb_test',

  // redis 配置，默认是本地
  redis_host: '127.0.0.1',
  redis_port: 6379,
  redis_db: 0,
  redis_password: '',

  session_secret: 'colorful_club_secret', // 务必修改
  auth_cookie_name: 'colorful_club',
  jwtTokenSecret: 'colorful_club',//jwt加密的密钥

  // 程序运行的端口
  port: 3000,



  // RSS配置
  rss: {
    title: 'CNode：Node.js专业中文社区',
    link: 'http://cnodejs.org',
    language: 'zh-cn',
    description: 'CNode：Node.js专业中文社区',
    //最多获取的RSS Item数量
    max_rss_items: 50
  },

  log_dir: path.join(__dirname, 'logs'),

  // 邮箱配置
  mail_opts: {
    host: 'smtp.qq.com',
    port: 465,
    auth: {
      user: '2397560398@qq.com',
      pass: 'qujjcbmbgtyqebfe'
    },
    ignoreTLS: true,
  },

  // 腾讯优图配置
  tencent: {
    'appid': '10114402',
    'secretId': 'AKIDpfLxOoG8FC1veFtP3XUHwPldQCoKlBTi',
    'secretKey': 'JSAmJfp8IG3g8Zt6B8vjPuxvjYBey7HL',
  },

  /*//weibo app key
  weibo_key: 10000000,
  weibo_id: 'your_weibo_id',*/

  /*// admin 可删除话题，编辑标签。把 user_login_name 换成你的登录名
  admins: { user_login_name: true },*/


  // 下面两个配置都是文件上传的配置

  // 7牛的access信息，用于文件上传
  qn_access: {
    accessKey: 'your access key',
    secretKey: 'your secret key',
    bucket: 'your bucket name',
    origin: 'http://your qiniu domain',
    // 如果vps在国外，请使用 http://up.qiniug.com/ ，这是七牛的国际节点
    // 如果在国内，此项请留空
    uploadURL: 'http://xxxxxxxx',
  },


};

if (process.env.NODE_ENV === 'test') {
  config.db = 'mongodb://127.0.0.1/node_club_test';
}

module.exports = config;