var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var Promise = require('bluebird');
var movieController = require('./Movie');
var Movie = require('../models/movie.js');
var charset = require('superagent-charset');
var superagent = charset(require('superagent'));

// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
// var ObjectId = Schema.Types.ObjectId;

var i = 0;
var baseUrl = 'http://www.dy2018.com';
var exUrl = '.html';
var maxNum = 20;
var imgPath = '/images'

var movies = [];

// 1. 传入电影列表 url, 拿到要抓取的电影列表;
// 2. 解析列表, 并创建抓取影片详情的 Promise 任务数组
// 3. 执行抓取影片的任务（解析并保存数据）
// 4. 显示抓取结果

// 获取取网页内容
exports.fetchPage = (req, res) => {
     getPageAsync ( 'http://www.dy2018.com/html/gndy/dyzz/index.html')
        .then ( parseList, (err) => {
            console.log('抓取网页时出错：\n' + err);
        } )
        .then(function(){
            console.log('完成抓取');
        })

    // 解析列表, 并依次抓取影片数据
    function parseList ( html ) {
        return new Promise( function (resolve, reject) {
            console.log('开始解析列表');
            var $ = decodeHtml(html);
            if ($.text().indexOf('window.location=') >= 0){
                console.log('需要跳转', $.text());
                var s = $.text().replace('window.location=', 'global.newUrl=');

                var vm = require('vm');
                vm.runInThisContext(s);
                console.log(baseUrl + global.newUrl);
                
                // getPageAsync ( baseUrl + global.newUrl )
                //     .then ( parseList, function (err){
                //         console.log('抓取网页时出错：\n' + err);
                //     } )

            }
            var _id = '';
            var i = 0;
            $('.co_content8 a').each( function (){
                if ( i >= maxNum ) return false;
                i++;
                _id = $(this).attr('href');
                if ( '/i/' === _id.substr(0,3) ){
                    getPageAsync (parseUrl (_id))
                        .then ( filterMovie )
                        .then ( saveMovie )
                        .then ( showMovie )
                }
            });
        });
    };




// 解析电影详情网页内容，返回一个JSON
function filterMovie ( html ) {
    console.log('开始解析影片详情页面')
    var title, name = '', oldName, year, country, language, type, subtitle, imdb, douban, 
        format, videoSize, fileSize, videoLength, director, starring, intro, poster, imgs, download;
    var starring = [], awards = [], catetorys = [];
    var movie = {};

    var $ = decodeHtml(html);
    console.log($.text());
    title = $('.title_all h1').text().trim();
    $('.co_content8 .position a').each(function (){
        catetorys.push($(this).text());
    });

    // poster = saveImage( $('#Zoom p img').first().attr('src'), 'poster.jpg');
    poster = $('#Zoom p img').first().attr('src');
    imgs = $('#Zoom p img').last().attr('src');

    var _txt = '';
    var _t = '';
     $('#Zoom p').each( function () {
         _txt = $(this).text().trim()
         if ( _t = _txt.split('◎译　　名')[1] ) {
            name = _t.trim();
         }
         if ( _t = _txt.split('◎片　　名')[1] ) {
            oldName = _t.trim();
         }
         if ( _t = _txt.split('◎年　　代')[1] ) {
            year = _t.trim();
         }
         if ( _t = _txt.split('◎国　　家')[1] ) {
            country = _t.trim();
         }
         if ( _t = _txt.split('◎类　　别')[1] ) {
            type = _t.trim();
         }
         if ( _t = _txt.split('◎语　　言')[1] ) {
            language = _t.trim();
         }
         if ( _t = _txt.split('◎字　　幕')[1] ) {
            subtitle = _t.trim();
         }
         if ( _t = _txt.split('◎IMDb评分')[1] ) {
            idmb = _t.trim();
         }
         if ( _t = _txt.split('◎豆瓣评分')[1] ) {
            douban = _t.trim();
         }
         if ( _t = _txt.split('◎文件格式')[1] ) {
            format = _t.trim();
         }
         if ( _t = _txt.split('◎视频尺寸')[1] ) {
            videoSize = _t.trim();
         }
         if ( _t = _txt.split('◎文件大小')[1] ) {
            fileSize = _t.trim();
         }
         if ( _t = _txt.split('◎片　　长')[1] ) {
            videoLength = _t.trim();
         }
         if ( _t = _txt.split('◎导　　演')[1] ) {
            director = _t.trim();
         }
         if ( _t = _txt.split('◎主　　演')[1] ) {
             starring.push( _t.trim() );
             $(this).nextAll().each( function () {
                 _t = $(this).text();
                 if ( _t && _t.indexOf('◎简　　介') >= 0 ){
                     return false;
                 } else {
                    starring.push(_t.trim());
                 }
             })
         }
         if ( _txt.indexOf('◎简　　介') >= 0 ) {
            intro = $(this).text();
         }
         if ( _t = _txt.split('◎获奖情况')[1] ) {
            awards.push( _t.trim() );
             $(this).nextAll().each( function () {
                 _t = $(this).text();
                 if ( _t && _t.indexOf('◎影片截图') >= 0 ){
                     return false;
                 } else {
                    awards.push(_t.trim());
                 }
             })
         }
     })

    download = $('#Zoom a').attr('href');
    
    movie = {
          title: title 
        , name: name 
        , oldName: oldName 
        , year: year
        , country: country 
        , category: catetorys
        , language: language
        , type: type 
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
        , award: awards   
        , poster: poster   
        , imgs: imgs
        , download: download
        // , trailer: trailer  
    };
    
    // return JSON.stringify(movie);
    return (movie);
}

function saveMovie (movie) {
    // TODO:调用 Movie.save 保存影片到数据库中，保存图片到本地服务器
    if (movie)  movieController.saveMovie(movie);
}

function showMovie( movie ){
    // movies.push(movie);
    res.redirect('/admin/spider/list');
}

function saveImage ( url, name ) {
    var _url = imgPath + name;
    http.get( url, function(res) {
        var _imgData = '';
        res.setEncoding('binary');

        res
            .on('data', function(chunk){
                _imgData += chunk;
            })
            .on('end', function(){
                fs.writeFile(_url, _imgData, 'binary', function(err){
                    if (err){
                        console.log('获取图片错误：\n' + err);
                    }
                    return _url;
                })
            })
        
    });
};


// 抓取指定 url 网页内容，并返回 Promise 实例
function getPageAsync ( url ) {
    return new Promise( function (resolve, reject) {
        console.log('开始抓取网址：' + url);
        if ( !url ) reject();

        superagent
            .get( url )
            .charset('gb2312')
            .on('error', err => {
                console.log('抓取失败！' + url);
                console.log(err);
                reject(e)
            })
            .end((err, res) => {
                resolve(res.text);
                console.log('抓取成功！');
            })



        // var req = request({
        //     headers: {
        //         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.112 Safari/537.36',
        //         Referer: "http://www.dy2018.com/html/gndy/dyzz/index.html?__wangan=3eb6560c90791a938cb2dfb49819052c61487828362_473387"
        //     },
        //     timeout: 30000,
        //     url: url
        // });

        // req.on('error', function(err) {
        //     console.log('抓取失败！' + url);
        //     console.log(err);
        //     reject(e);
        // });
        // req.on('response', function(res) {
        //     var bufferHelper = new BufferHelper();
        //     res.on('data', function (chunk) {
        //         bufferHelper.concat(chunk);
        //     });
        //     res.on('end',function(){
        //         var result = bufferHelper.toBuffer();
        //         resolve(result);
        //         console.log('抓取成功！');
        //         console.log(iconv.decode(result, 'gb2312'));
        //     });
        // });
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
    // return (cheerio.load( iconv.decode(html, charset)));
    return (cheerio.load( html));
};

// 转换url
function parseUrl (id) {
    return baseUrl + id;
}

};

// 显示新抓取的内容
exports.list = function(req, res){
    var rows = parseInt(req.query.r, 10) || 10;
    var page = parseInt(req.query.p, 10) || 1;

    Movie
        .where('state').gte(0)
        .populate('category')
        .exec((err, movies) => {
            if (err) handleError(err);
            
            var results = movies.slice((page - 1) * rows, page * rows );
            res.render('spider_list', {
                title: "抓取结果列表"
                , movies: results
                , currentPage: page
                , totalPage: Math.ceil( movies.length / rows)
                , rows: rows
            })
        })
}

function handleError (err) {
    console.log(err);
}

