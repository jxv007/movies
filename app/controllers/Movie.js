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
    newMovie(movieObj, function(){
      res.redirect('/admin/movie/' + movie._id);
    })
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

// 保存抓取的影片数据
// 1. 查找是否已经存在相同名称、相同导演的影片，如存在则做更新处理
// 2. 查找影片类型是否都已经存在，不存在的要创建类型
// 3. new Movie, 保存，保存影片时，需要更新类型中的引用。
exports.saveMovie = function (movieObj){
  console.log('保存影片数据：');

  var _asyncArray = [];
  movieObj.category.forEach( function (name) {
    _asyncArray.push(getCategoryIdAsync(name));
  })
  
  Promise.all(_asyncArray)
    .then( res => {
      console.log(res);
      movieObj.category = res;
      newMovie(movieObj);
    })
};

function getCategoryIdAsync (name){
  return new Promise( function (resolve, reject) {
      Category.findByName(name, function(err, category){
        if (err) {
          console.log(err);
          return;
        }

        if ( category ) {
          resolve( category._id );
        } else {
          category = new Category({name: name});
          category.save( (err, category) => {
            if (err) {
              console.log(err);
              return;
            }
           resolve( category._id );
          });
        }
      });
  });
}

// 创建 Movie 实例，保存到数据库，并关联 movie 和 category
// 注意 category 应该是 categoryId 数组
function newMovie ( movieObj, cb ) {
  console.log('创建影片实例')
  console.log(movieObj);
  var movie = new Movie( movieObj );
  movie.save( function (err, movie) {
    if (err) {
      console.log(err);
      return;
    }

    movieObj.category.forEach(function (categoryId){
      saveCategory(movie._id, categoryId);
    });
    if (cb) cb();
  });
  return movie;
};


// 给影片增加类别
function saveCategory(movieId, categoryId){
  Movie.findById(movieId, function(err, movie){
    if (err) {
      console.log(err);
      return;
    }

    if (movie) {
      Category.findById(categoryId, function(err, category){
        if (err) {
          console.log(err);
          return;
        }
        if (category) {
          movie.category.push(categoryId);
          movie.save(function(err, movie){
            if (err) {
              console.log(err);
              return;
            }
          });
        }
      });
    }
  });
}