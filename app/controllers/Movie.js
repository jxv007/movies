var Movie = require('../models/movie.js');
var Comment = require('../models/comment.js');
var Category = require('../models/category.js');

// 路由器解析 —— 显示影片录入页
// 传入categories 和一个新创建的 movie 空对象
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

exports.saveState = (req, res) => {
  var id = req.query.id;
  console.log('state.....' + id);
  // var movieObj = req.body.movie;
  if (id) {
    Movie.findById(id, (err, movie) => {
      movie.state = 1;
      console.log(movie.state);
        movie.save((err, movie)=>{
          res.json({ success: 1 });
        })
    })
  }
}

/*
// admin post movie 后台更新页
// 保存从后台录入页post过来的数据
    从表单 post 的数据可能是新增的，也可能是对已有数据的更新，所以要判断数据中是否存有影片 _id：
    服务端通过 bodyParser 解析表单信息，将结果放在 req.body 中，通过 req.body.movie 取到该表单中的信息。
    那么 req.body.movie._id 就是隐藏表单项的值了（_id）。
    _id 存在，则更新已有影片数据；_id 不存在，则创建一个新影片记录。
    保存影片同时要保存影片与分类的关系：在影片中保存分类ID，在分类中保存影片ID。
    影片和分类数据保存成功后，页面重定向到该电影的详情页.
    如果影片分类是一个新的分类（只有 categoryName 没有 categoryId），
    则要先创建并保存该影片ID到该分类中（建立关联）
    注意：因为 movieObj 中没有分类ID，所以创建分类后需要再次将 分类ID 保存中影片中。 
*/
exports.save = (req, res) => {
  var _movieID = req.body.movie._id;
  var movieObj = req.body.movie;

	if ( req.poster ) { 
		movieObj.poster = req.poster;
	}

  if ( _movieID ) {
    Movie.findById(_movieID, (err, movie) => {
      if (err) {
        console.log(err);
        return;
      }

      var originCategoryId = movie.category.toString();
      Movie.findOneAndUpdate({ _id: _movieID }, movieObj, { new: true }, (err, movie) => {
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
		var categoryId = movieObj.category; 
		var categoryName = movieObj.categoryName;
    var _movie = new Movie(movieObj);

		_movie.state = 1;
		_movie.save( (err, newMovie) => {
			if ( err ) {
					console.log(err);
			}
      // 处理影片分类，
			if ( categoryId ) {
        // 如果选择了已有的分类，则将此影片ID保存到该分类中
				Category.findById( categoryId, (err, cat) => {
          if ( err ) { console.log(err); }     

					cat.movies.push( newMovie._id );
					cat.save((err, category) => {
            if ( err ) { console.log(err); }     
						
						res.redirect('/admin/movie/' + newMovie._id);
					});
				});
			}
			else if ( categoryName ) { //若按钮分类没被选则打字新建一个
				var newCat = new Category({
					name: categoryName,
					movies: [newMovie._id]
				});
				
				newCat.save((err, category) => {
          if ( err ) { console.log(err); } 

					newMovie.category = category._id;
					newMovie.save((err, movie) => {
						res.redirect('/admin/movie/' + newMovie._id);
					});
				});
			}
      else {
        res.redirect('/admin/movie/' + newMovie._id);
      }
		});
  }
}

// list page
exports.list = function(req, res) {
    var rows = parseInt(req.query.r, 10) || 10;
    var page = parseInt(req.query.p, 10) || 1;

    Movie
        .find({'state': {'$gte': 0}})
        .sort({updateAt : -1})
        .populate('category')
        .exec((err, movies) => {
            if (err) handleError(err);
            var results = movies.slice((page - 1) * rows, page * rows );
            res.render('movie_list', {
                title: "影片列表"
                , movies: results
                , currentPage: page
                , totalPage: Math.ceil( movies.length / rows)
                , rows: rows
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
          title: movie.title,
          movie: movie,
          comments: comments
        })
      })
  })
}



// 解析movieObj，保存到影片数据库
// 1. 查找是否已经存在相同名称、相同导演的影片，如存在则做更新处理
// 2. 否则查找影片类型是否都已经存在，不存在的要创建类型
// 3. new Movie, 保存，保存影片时，需要更新类型中的引用。
exports.saveMovie = function (movieObj){
        if (!movieObj) {
            console.log('要保存的影片数据不存在');
            return;
        }
        console.log('保存影片数据：' + movieObj.title);

        var getMovie;

        getMovie = Movie.findOne({'name': movieObj.name}).exec()
            .then( function(movie){
                if (movie) {
                    console.log('影片已存在：' + movie.name);
                } else {
                    var getCates = [];
                    movieObj.category.forEach( function (name) {
                        getCates.push(getCategoryIdAsync(name));
                    })
                    
                    Promise.all(getCates)
                      .then( (res) => {
                        movieObj.category = res;
                        newMovie(movieObj);
                    })
                }
            })
            .then( function (){})
            .error(function(error){
                return 'Promise Error:'+ error;
            })
        return getMovie;
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

// 创建 Movie 实例，保存到数据库，
// 关联 movie 和 category：
// 1. 在 movie 中保存 categoryId
// 2. 在 category 中保存 movieID,
// 注意: category 中保存的是 categoryId 数组
function newMovie ( movieObj, cb ) {
  if (!movieObj) {
    throw new Error('Movie Object 不能为空');
  }
  console.log('创建影片实例：${movieObj.title}')
  
  var cats = movieObj.category;
  var movie = new Movie( movieObj );

  return movie.save( (err, movie) => {
      return movie._id;
    })
    .then( movieId => {
      cats.forEach( categoryId => {
        linkCategory(movieId, categoryId);
      })
    });
};

function linkCategory(movieID, categoryId) {
    return 
      Category.findById(categoryId)
        .then( category => {
          if (!category) {
            throw new Error('没找到类别ID：' + categoryId);
          }
          category.movies.push(movieID);
          return category.save();
        })
        .catch( err => {
          console.log('关联 movie 和 category 时出错' + err); 
        })
}

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