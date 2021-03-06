var Movie = require('../app/controllers/Movie.js');
var Index = require('../app/controllers/Index.js');
var User = require('../app/controllers/User.js');
var Category = require('../app/controllers/Category.js');
var Comment = require('../app/controllers/Comment.js');
var Admin = require('../app/controllers/Admin.js');
var Spider = require('../app/controllers/Spider.js');

module.exports = function(app){
  //pre handle
  app.use((req, res, next) => {
    app.locals.user = req.session.user;
    next();
  })

  //Index
  app.get('/', Index.index);

  //admin
  app.get('/admin',Admin.index);

  //Movie
  // 影片管理列表
  app.get('/admin/movie/list',User.signinRequired,User.adminRequired, Movie.list);
  // 更新影片
  app.get('/admin/movie/update/:id',User.signinRequired,User.adminRequired, Movie.update);
  // 从影片列表中删除
  app.delete('/admin/movie/list', Movie.del);
  // 新增影片
  app.get('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new);
  // 保存影片
  app.post('/admin/movie/save', Movie.save);
  app.get('/admin/movie/state', Movie.saveState);
  // 影片详情展示
  app.get('/admin/movie/:id', User.signinRequired, Movie.detail);
  // 影片详情展示
  app.get('/movie/:id', Movie.detail);

  //User
  app.get('/admin/user',User.signinRequired,User.adminRequired, User.list);
  app.post('/user/signup', User.signup);
  app.post('/user/signin',User.signin);
  app.get('/logout',User.logout);
  app.get('/signin',User.showSignin);
  app.get('/signup',User.showSignup);

  //Comment
  app.post('/user/comment',Comment.save);

  //Category
  app.get('/admin/category/new', User.signinRequired, User.adminRequired, Category.new);
  app.post('/admin/category/save', User.signinRequired, User.adminRequired, Category.save);
  app.get('/admin/category/list', User.signinRequired, User.adminRequired, Category.list);
  app.delete('/admin/category/list', Category.del);

  //Spider
  app.get('/admin/spider/fetch/:id', User.signinRequired, User.adminRequired, Spider.fetchPage);
  app.get('/admin/spider/list', User.signinRequired, User.adminRequired, Spider.list);
  app.delete('/admin/spider/list', User.signinRequired, User.adminRequired, Spider.del);
  app.get('/admin/spider/new', User.signinRequired, User.adminRequired, Spider.new);
  app.post('/admin/spider/save', User.signinRequired, User.adminRequired, Spider.save);
  app.get('/admin/spider', User.signinRequired, User.adminRequired, Spider.new);
  app.get('/admin/spider/update/:id', User.signinRequired, User.adminRequired, Spider.update);
  

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

}