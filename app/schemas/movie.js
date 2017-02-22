var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;


// 数据结构：
// var movies = {
//     title: title,
//     name: name,                 // 译　　名　奇异博士/斯特兰奇博士/史特兰奇博士/奇怪博士/怪奇医生/奇异医生/史奇医生
//     oldName: oldName,           // 片　　名　Doctor Strange
//     year: year,                 // 年　　代　2016
//     country: [],                // 国　　家　美国
//     categorys: [],              // 类　　别　动作/科幻/奇幻/冒险
//     language: language,         // 语　　言　英语
//     subtitle: subtitle,         // 字　　幕　中英双字幕
//     imdb: imdb,                 // IMDb评分  7.8/10 from 199,761 users
//     douban: douban,             // 豆瓣评分　7.8/10 from 184,372 users
//     format: format,             // 文件格式　x264 + aac
//     videoSize: videoSize,       // 视频尺寸　1280 x 720
//     fileSize: fileSize,         // 文件大小　1CD
//     videoLength: videoLength,   // 片　　长　115分钟
//     director: director,         // 导　　演　斯科特·德瑞克森 Scott Derrickson
//     starring: [],               // 主　　演　本尼迪克特·康伯巴奇 Benedict Cumberbatch
//     intro: intro,               // 简　　介
//     award: award,               // 获奖情况
//     poster: poster,             // 海报图片地址
//     imgs: [],                   // 影片截图
//     trailer: []                 // 预告片地址
// };

var MovieSchema = new Schema({
    title: String          // 标　　题
  , name: String           // 译　　名　奇异博士/斯特兰奇博士/史特兰奇博士/奇怪博士/怪奇医生/奇异医生/史奇医生
  , oldName: String        // 片　　名　Doctor Strange
  , year: String           // 年　　代　2016
  , country: String        // 国　　家　美国
  , category:[{             // 类　　别　动作/科幻/奇幻/冒险
        type: ObjectId
      , ref: 'Category'
    }]
  , language: String        // 语　　言　英语
  , subtitle: String        // 字　　幕　中英双字幕
  , imdb: String            // IMDb评分  7.8/10 from 199,761 users
  , douban: String          // 豆瓣评分　7.8/10 from 184,372 users
  , format: String          // 文件格式　x264 + aac
  , videoSize: String       // 视频尺寸　1280 x 720
  , fileSize: String        // 文件大小　1CD
  , videoLength: String     // 片　　长　115分钟
  , director: String        // 导　　演　斯科特·德瑞克森 Scott Derrickson
  , starring: []            // 主　　演　本尼迪克特·康伯巴奇 Benedict Cumberbatch
  , intro: String           // 简　　介
  , award: []           // 获奖情况
  , poster: String          // 海报图片地址
  , imgs: String            // 影片截图
  , trailer: String         // 预告片地址
  , download: String        // 下载地址
  , state: {                // 状态：0 - 草稿；1 - 待审核； 2 - 审核通过； 3 - 审核未通过
      type: Number,
      default: 0 
    }
  , meta:{
      createAt:{
        type:Date,
        default:Date.now()
      }
    , updateAt:{
        type:Date,
        default:Date.now()
      }
    }
});

MovieSchema.pre('save',function(next){
  if(this.isNew){
    this.createAt = this.updateAt = Date.now();
  }else{
    this.updateAt = Date.now();
  }
  next();
})

MovieSchema.statics = {
  fetch: function(cb){
    return this
      .find({})
      .sort('meta.updateAt')
      .exec(cb)
  },
  findById: function(id,cb){
    return this
      .findOne({_id:id})
      .exec(cb)
  }
}

module.exports = MovieSchema;