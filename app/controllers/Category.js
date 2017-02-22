var Category = require('../models/category.js');

//admin new page
exports.new = (req, res) => {
  res.render('category_admin', {
    title: '影片分类录入页',
    category: {}
  });
}

exports.save = (req, res) => {
  var _category = req.body.category;
  newCategory(_category, function(){
    res.redirect('/admin/category/list');
  });
}


// list page
exports.list = function(req, res) {
  Category
    .find()
    .populate({path:'movies',options:{limit:5}})
    .exec((err, categories) => {
      if (err) handleError(err);
      res.render('categoryList', {
        title: "imooc 列表页",
        categories: categories
      })
    })
}

//list delete category
exports.del = (req, res) => {
  var id = req.query.id;
  if (id) {
    Category.remove({ _id: id }, (err, category) => {
      if (err) {
        console.log(err);
        return;
      }
      res.json({ success: 1 });
    })
  }
}

function saveMovie(movieId, categoryId){
  Category.findById(categoryId, function(err, category){
      if (err) {
        console.log(err);
        return;
      }

      category.movies.push(movieId);
      category.save(function(err, category){
        if (err) {
          console.log(err);
          return;
        }
      });
    });
}

// 通过类别名称创建类别，如果已存在同名类别则返回该类别，否则返回新创建的类别
exports.saveCategoryByName = function (name){
  var category = Category.findOne({name:name});
  if ( category ) {
    return categories;
  } else {
    return newCategory( {name: name} );
  }
}

// 创建类别实例
function newCategory (categoryObj, cb){
  var category = new Category(categoryObj);
  category.save((err, category) => {
    if (err) {
      console.log(err);
      return;
    }
  })
  cb();
  return category;
}