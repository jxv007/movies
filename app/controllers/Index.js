var Movie = require('../models/movie.js');
var Category = require('../models/category.js');

//index page
exports.index = (req, res) => {
  Category
    .find() // 找到所有分类
    .populate({path: 'movies', options: {limit: 6}}) //每个分类只取5条记录
    .exec( (err,categories) => {
      if(err){
        console.log(err);
        return;
      }
      res.render('index', {
        title: 'IVR影院首页',
        categories: categories
      });
    });
};