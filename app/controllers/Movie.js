var Movie = require('../models/movie.js');
var Comment = require('../models/comment.js');
var Category = require('../models/category.js');

//admin update movie
exports.update = (req, res) => {
  var id = req.params.id;
  if (id) {
    Movie.findById(id, (err, movie) => {
      if (err) {
        console.log(err);
        return;
      }
      Category.find((err, categories) => {
        res.render('movie_admin', {
          title: '后台更新页',
          movie: movie,
          categories: categories
        })
      })
    })
  }
}

// admin post movie
exports.save = (req, res) => {
  var id = req.body.movie._id;
  var movieObj = req.body.movie;
  var _movie;
  if (id) {
    Movie.findById(id, (err, movie) => {
      if (err) {
        console.log(err);
        return;
      }
      /*_movie = _.extend(movie,movieObj);
      _movie.save((err,movie)=>{
        if(err) return handleError(err);
        res.redirect('/movie/'+movie._id);
      })*/
      var originCategoryId = movie.category.toString();
      Movie.findOneAndUpdate({ _id: id }, movieObj, { new: true }, (err, movie) => {
        if (err) {
          console.log(err);
          return;
        }
        if (originCategoryId === movie.category.toString()) {
          console.log('is equal');
        } else {
          Category.findById(originCategoryId, (err, category) => {
            if (err) {
              console.log(err);
              return;
            }
            category.movies.splice(category.movies.indexOf(movie._id),1);
            category.save((err,category)=>{
              if(err){
                console.log(err);
                return;
              }

            })
            Category.findById(movie.category.toString(), (err, category) => {
              if(err){
                console.log(err);
                return;
              }
              category.movies.push(movie);
              category.save((err,category)=>{
                if(err){
                  console.log(err);
                  return;
                }
              })
            })
          })
        }
        res.redirect('/admin/movie/' + movie._id);
      });

    })
  } else {
    _movie = new Movie(movieObj);
    var categoryId = _movie.category;
    _movie.save((err, movie) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(categoryId);
      Category.findById(categoryId, (err, category) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log(category);
        category.movies.push(movie);
        category.save((err, category) => {
          res.redirect('/admin/movie/' + movie._id);
        })
      })
    })
  }
}

// list page
exports.list = function(req, res) {
  Movie
    .find()
    .populate('category')
    .exec((err, movies) => {
      if (err) handleError(err);
      console.log(movies);
      res.render('movie_list', {
        title: "imooc 列表页",
        movies: movies
      })
    })
}

//list delete movie
exports.del = (req, res) => {
  var id = req.query.id;
  console.log(333);
  console.log(id);
  if (id) {
    Movie.remove({ _id: id }, (err, movie) => {
      if (err) {
        console.log(err);
        return;
      }
      res.json({ success: 1 });
    })
  }
}

// detail page
exports.detail = function(req, res) {
  var id = req.params.id;
  Movie.findById(id, (err, movie) => {
    if (err) {
      console.log(err);
      return;
    }
    Comment
      .find({ movie: id })
      .populate('from rely.from rely.to', 'username')
      .exec((err, comments) => {
        res.render('movie_detail', {
          title: '影片详情',
          movie: movie,
          comments: comments
        })
      })
  })
}

// 显示影片录入页
exports.new = function(req, res) {
  Category.find((err, categories) => {
    if (err) {
      console.log('Movie new without category error:\n' + err);
      return;
    }

    res.render('movie_admin', {
      title: '电影录入页',
      categories: categories,
      movie: {}
    })
  })
};

exports.saveMovie = function (movie){
  console.log('保存影片数据：');
    console.log(movie.category);
    var _cats = [];
    movie.category.forEach( function (name){
      console.log(name);
      Category.findOne( {name: name}, function(err, category) {
        if (err) {
          console.log(err);
          return;
        }
        if ( !category ) {
            var category = new Category({name: name});
            category.save((err, category) => {
              if (err) {
                console.log(err);
                return;
              }
            });
        }
        _cats.push( category );
      });
    });

    movie.category = _cats;

    var _movie = new Movie(movie);

    _movie.save( function (err, movie) {
      if (err) {
        console.log(err);
        return;
      }
    
      // 遍历电影分类数组，在每一个电影分类中关联此电影的ID
      movie.category.forEach( function (id){
        Category.findOne( {id: id}, function(err, category) {
          console.log(category.name);
          if (err) {
            console.log(err);
            return;
          }
          category.movies.push(movie);
          category.save((err, category) => {
              if (err) {
                console.log(err);
                return;
              }
            });
        });
      });
    });
};