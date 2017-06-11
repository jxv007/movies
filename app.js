var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Promise = require('bluebird');
var _ = require('underscore');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var app = express();

app.locals.moment = require('moment');

// mongoDB
mongoose.Promise = Promise;
var db = mongoose.connect('mongodb://localhost:27017/movies');
db.connection.on("error", function(err){
  // 连接mongodb前要启动 mongd 服务
  console.log("数据库连接失败： " + err);
});

db.connection.on("open", function(){
  console.log("----- 数据库连接成功！-----");
});

// view engine setup
app.set('views', path.join(__dirname, 'app/views/pages'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret:'imooc',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    url:'mongodb://localhost:27017/movies',
    collection:'sessions'
  })
}));

if('development' === app.get('env')){
  app.set('showStackError',true);
  app.use(logger(':method :url :status'));
  app.locals.pretty = true;
  mongoose.set('debug',true);
}

require('./config/routes.js')(app);

console.log('IVR movies is started!');

module.exports = app;
