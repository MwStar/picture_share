var config = require('../config');
var pathLib = require('path')

/*process.env 是读取系统环境变量的，启动服务的时候，
设置环境变量为production或者development，
那么在程序里面就可以通过process.env.ENVNAME获取，
因为你在node命令窗口启动时没有设置相关的环境变量，
所以就没办法获取到了，你可以试一下NODE_ENV=development node
来启动命令窗口，然后应该就可以获取到了*/
var env = process.env.NODE_ENV || "development"


var log4js = require('log4js');
log4js.configure({
  /*appenders: [
    { type: 'console' },
    { type: 'file', filename: pathLib.join(config.log_dir, 'cheese.log'), category: 'cheese' }
  ]*/
  appenders: { cheese: { type: 'file', filename: pathLib.join(config.log_dir, 'cheese.log') } },
	categories: { default: { appenders: ['cheese'], level: 'error' } }
});

var logger = log4js.getLogger('cheese');
//logger.setLevel(config.debug && env !== 'test' ? 'DEBUG' : 'ERROR')

module.exports = logger;