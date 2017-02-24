var Movie = require('../models/movie.js');
var Category = require('../models/category.js');

//index page
// 分类显示影片，每类显示6条已发布的影片
exports.index = (req, res) => {
  Category
    .find() // 找到所有分类
    .populate({
      path: 'movies'
      , match: {'state': 1}
      , options: {limit: 6}}) //每个分类取6条记录
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