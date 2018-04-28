var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('./config');

/*var index = require('./routes/index');
var users = require('./routes/users');*/

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
//上传文件是报错413，request entity too large，bodyParser默认限制为1mb,修改默认limit，为50mb
//上传文件是报错413，too many parameters，bodyParser默认限制参数为,修改默认parameterLimit，为50000
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit:50000}));
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use('/img_dev', express.static(path.join(__dirname, 'uploads')));
//app.use(express.static(path.join(__dirname, 'public')));

//中间件---服务器允许Cros实现跨域请求
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');//跨域
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,authorization,x-requested-with');
    res.header('Access-Control-Allow-Credentials','true');
    next();
};
app.all('*',allowCrossDomain);

//通用中间件
//app.use(cookieParser(config.session_secret));


//路由
var webRouter = require('./router');
app.use('/', webRouter);
/*app.use('/', index);
app.use('/users', users);*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
