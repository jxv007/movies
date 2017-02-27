var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SpiderSchema = new Schema({
    title: String          // 标　　题
  , url: String             // 列表地址
  , baseUrl: String         // 基础地址
  , maxNumber: Number       // 最大数量
  , listContainer: String   // 列表容器标志
  , listTag: String         // 列表项标志
  , name: String           // 译　　名　奇异博士/斯特兰奇博士/史特兰奇博士/奇怪博士/怪奇医生/奇异医生/史奇医生
  , oldName: String        // 片　　名　Doctor Strange
  , year: String           // 年　　代　2016
  , country: String        // 国　　家　美国
  , category:String          // 类　　别　动作/科幻/奇幻/冒险
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

SpiderSchema.pre('save',function(next){
  if(this.isNew){
    this.createAt = this.updateAt = Date.now();
  }else{
    this.updateAt = Date.now();
  }
  next();
})

SpiderSchema.statics = {
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

module.exports = SpiderSchema;