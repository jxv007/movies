var Movie = require('../app/controllers/Movie.js');
var Index = require('../app/controllers/Index.js');
var User = require('../app/controllers/User.js');
var Category = require('../app/controllers/Category.js');
var Comment = require('../app/controllers/Comment.js');
var Admin = require('../app/controllers/Admin.js');

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
  app.get('/admin/movie',User.signinRequired,User.adminRequired, Movie.list);
  app.get('/admin/movie/update/:id',User.signinRequired,User.adminRequired, Movie.update);
  app.delete('/admin/movie/list', Movie.del);
  app.get('/admin/movie/:id', User.signinRequired, Movie.detail);
  app.get('/admin/movie/new', User.signinRequired, User.adminRequired, Movie.new);
  app.post('/admin/movie/save', Movie.save);
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
  app.get('/admin/category/new',User.signinRequired, User.adminRequired, Category.new);
  app.post('/admin/category/save',User.signinRequired, User.adminRequired, Category.save);
  app.get('/admin/category',User.signinRequired, User.adminRequired, Category.list);

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