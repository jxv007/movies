var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var Promise = require('bluebird');

var i = 0;
var baseUrl = 'http://www.ygdy8.net/html/gndy/dyzz/20170215/53233.html';
var movieIds = [];

// 1. 拿到要获取的电影列表地址
// 2. 解析电影列表, 创建抓取影片详情的任务数组
// 3. 执行抓取影片的任务（解析并保存数据）
// 4. 显示结果


// 获取取网页内容
exports.fetchPage = (req, res) => {
   var _url = req.body.url;
    getPageAsync(_url);
};

exports.list = function(req, res){
    res.render('spider_list', {
        title: '抓取结果列表',
        movies: {}
    })
};



// 解析电影详情网页内容
function filterMovies ( html ) {
    html = iconv.decode(html, 'gb2312'); //目标网页为gb2312, 需要转码为u8
                    
    var $ = cheerio.load(html); //使用 cheerio 解析
    var title = $('.title_all font').text().trim();
    var introduce = $('.co_content8 p').text().trim();
    var imgs = $('.co_content8 p img');
    var poster = '';
    var imgUrl = '';

    if (imgs[0]) {
        poster = imgs[0].attr('src').trim();
        imgUrl = imgs[1].attr('src').trim();
    } else {
        poster = imgs.attr('src').trim();
    } 

    var movie = {
        title: title,
        introduce: introduce,
        poster: poster,
        imgurl: imgurl
    };

    console.log('标题：' + movie.title + '\n');
    console.log(movie.introduce + '\n');
    console.log(movie.imgurl + '\n');
}

function getPageAsync ( _url ) {
    return new Promise( function (resolve, reject) {
        console.log('开始抓取网址：' + _url);

        http.get(_url, function (res) {
            var bufferHelper = new BufferHelper();
            res
                .on('data', function (chunk){
                    bufferHelper.concat(chunk);
                })
                .on('end', function (){
                    resolve(bufferHelper.toBuffer());
                })
                .on('error', function(e){
                    console.log('抓取网址出错：' + _url)
                    reject(e);
                })
        })
    });
}

function printData (movie) {

}

var fetchMovieArray = [];

// 创建抓取电影详情页的任务数组
movieIds.forEach( function (id) {
    fetchMovieArray.push( getPageAsync( baseUrl + id));
})

Promise
  .all([])
  .then( function (pages) {
      console.log('抓取完成，开始解析并处理数据');
      // 遍历所有页面，逐个解析
      var moviesData = [];
      
      pages.forEach( function (html) {
          var movies = filterMovies( html );
      })



  })

// 抓取电影天堂dy2018.com网站上的电影数据
// 抓取到本地存储，并显示出来

// 数据结构：
// var movies = {
//     title: title,
//     name1: name1,               // 译　　名　奇异博士/斯特兰奇博士/史特兰奇博士/奇怪博士/怪奇医生/奇异医生/史奇医生
//     name2: name2,               // 片　　名　Doctor Strange
//     year: year,                 // 年　　代　2016
//     country: [],                // 国　　家　美国
//     category: [],               // 类　　别　动作/科幻/奇幻/冒险
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


