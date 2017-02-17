var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');

var i = 0;
var url = 'http://www.ygdy8.net/html/gndy/dyzz/20170215/53233.html';



exports.fetchPage = (req, res) => {
    var _url = req.body.url;
    startRequest(url);
    
};

exports.list = function(req, res){
    res.render('spider_list', {
        title: '抓取结果列表',
        movies: {}
    })
};

function startRequest(url){
    http.get(url, function (res){
        var html = '';
        var titles = [];
        var bufferHelper = new BufferHelper();

        res
            .on('data', function (chunk){
                bufferHelper.concat(chunk);
            })
            .on('end', function (){
                html = iconv.decode(bufferHelper.toBuffer(), 'gb2312'); //转码
                var $ = cheerio.load(html); //使用 cheerio 解析
                var title = $('.title_all font').text().trim();
                var introduce = $('.co_content8 p').text().trim();
                var imgurl = $('.co_content8 p img').attr('src').trim();

                var movie = {
                    title: title,
                    introduce: introduce,
                    imgurl: imgurl
                };

                console.log('标题：' + movie.title + '\n');
                console.log(movie.introduce + '\n');
                console.log(movie.imgurl + '\n');
                
            })
        
        re
    })
}

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


