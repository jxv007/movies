var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var Promise = require('bluebird');
var Movie = require('Movie');

var i = 0;
var baseUrl = 'http://www.dy2018.com';
var exUrl = '.html';
var movieIds = [97150, 97322];

// 1. 传入电影列表 url, 拿到要抓取的电影列表;
// 2. 解析列表, 并创建抓取影片详情的 Promise 任务数组
// 3. 执行抓取影片的任务（解析并保存数据）
// 4. 显示抓取结果

// 获取取网页内容
exports.fetchPage = (req, res) => {
     getPageAsync( 'http://www.dy2018.com/html/gndy/dyzz/index.html')
        .then(function (html){ parseList(html) })
};

exports.list = function(req, res){
    res.render('spider_list', {
        title: '抓取结果列表',
        movies: {}
    })
};

// 解析列表, 并依次抓取影片详情
function parseList ( html ) {
    console.log('开始解析列表');
    var $ = decodeHtml(html);
    var fetchArray = [];
    var _id = '';
    $('.co_content8 a').each( function (){
        _id = $(this).attr('href');
        if ( '/i/' === _id.substr(0,3) ){
            getPageAsync(parseUrl(_id)).then (function (html) {
                    filterMovies (html);
                });
        }
    });
};

var MovieSchema = {
    title: String          // 标　　题
  , name: String           // 译　　名　奇异博士/斯特兰奇博士/史特兰奇博士/奇怪博士/怪奇医生/奇异医生/史奇医生
  , oldName: String        // 片　　名　Doctor Strange
  , year: Number           // 年　　代　2016
  , country: String        // 国　　家　美国
  , category:{             // 类　　别　动作/科幻/奇幻/冒险
        type:ObjectId
      , ref:'Category'
    }               
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
  , award: String           // 获奖情况
  , poster: String          // 海报图片地址
  , imgs: String            // 影片截图
  , trailer: String         // 预告片地址
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
};


// 解析电影详情网页内容
// TODO: 解析影片数据，存储到数据库，并显示出来

function filterMovies ( html ) {
    console.log('开始解析影片详情页面')
    var $ = decodeHtml(html);
    var title = $('.title_all h1').text().trim();
    var introduce = $('#Zoom p').text().trim();
    // var imgs = $('#Zoom p img');
    // var poster = '';
    // var imgUrl = '';
    var download = $('#Zoom a').attr('href');

    // if (imgs[0]) {
    //     poster = imgs[0].attr('src');
    //     imgUrl = imgs[1].attr('src');
    // } else {
    //     poster = imgs.attr('src');
    // } 

    var movie = {
          title: title 
        , name: name 
        , oldName: oldName 
        , year: year
        , country: country 
        , category:{
              type:ObjectId
            , ref:'Category'
            }               
        , language: language 
        , subtitle: subtitle  
        , imdb: imdb  
        , douban: douban   
        , format: format     
        , videoSize: videoSize 
        , fileSize: fileSize   
        , videoLength: videoLength 
        , director: director 
        , starring: []    
        , intro: intro      
        , award: award   
        , poster: poster   
        , imgs: imgs   
        , trailer: trailer  
        , state: {        
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
        };

    printData(movie);
};

function saveMovie (movie) {
    // TODO:调用 Movie.save 保存影片到数据库中，保存图片到本地服务器

}

// 抓取指定 url 网页内容，并返回 Promise 实例
function getPageAsync ( url ) {
    return new Promise( function (resolve, reject) {
        console.log('开始抓取网址：' + url);
        if ( undefined === url) return;
        http.get(url, function (res) {
            var bufferHelper = new BufferHelper();
            res
                .on('data', function (chunk){
                    bufferHelper.concat(chunk);
                })
                .on('end', function (){
                    resolve(bufferHelper.toBuffer());
                    console.log(bufferHelper.toBuffer());
                    console.log('抓取成功！');
                })
                .on('error', function(e){
                    console.log('抓取失败！' + url);
                    reject(e);
                });
        });
    });
};

// 打印影片数据
function printData (movie) {
    console.log('标题：' + movie.title + '\n');
    console.log(movie.introduce + '\n');
    console.log(movie.download + '\n');
}

// 将网页转为 UTF-8，并返回 cheerio 解析解析的 DOM
function decodeHtml ( html, charset = 'gb2312' ) {
    var _html = iconv.decode(html, charset);
    // console.log (_html);
    return (cheerio.load( _html ));
};

// 转换url
function parseUrl (id) {
    return baseUrl + id;
}