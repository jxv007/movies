var http = require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var request = require('request');
var iconv = require('iconv-lite');
var BufferHelper = require('bufferhelper');
var Promise = require('bluebird');

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

    // getPageAsync( 'http://www.dy2018.com/html/gndy/dyzz/index.html' )
    //     .then( parseList( html ))
        // .all( fetchMovieArray )
        // .then( function ( pages ) {

        // });
    // res.redirect('/admin/spider/list');
};

exports.list = function(req, res){
    res.render('spider_list', {
        title: '抓取结果列表',
        movies: {}
    })
};

// 解析列表, 并创建抓取影片详情的 Promise 任务数组
function parseList ( html ) {
    console.log('开始解析列表');
    var $ = decodeHtml(html);
    var fetchArray = [];
    var _ids = [];
    var _id = '';
    $('.co_content8 a').each(function (){
        _id = $(this).attr('href');
        // todo: 判断一下 _id 是否是包含 /i/
        _ids.push(_id);
        console.log($(_id);
    });
    
    _ids.forEach( function (id) {
        fetchArray.push( getPageAsync(parseUrl(id)));
    });
    
    if ( fetchArray === []) {
        console.log('获取列表失败, 网页详情：' + $.text());
        return;
    }
    getPageAsync()
        .all (fetchArray)
        .then (function (html) {
            filterMovies ( html );
        } );
};

function parseUrl (id) {
    return baseUrl + id;
}

// 抓取指定 url 网页内容，并返回 Promise 实例
function getPageAsync ( url ) {
    return new Promise( function (resolve, reject) {
        console.log('开始抓取网址：' + url);
        
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
                    reject(e);
                    console.log('抓取失败！');
                });
        });
    });
};

// 将网页转为 UTF-8，并返回 cheerio 解析解析的 DOM
function decodeHtml ( html, charset = 'gb2312' ) {
    var _html = iconv.decode(html, charset);
    console.log (_html);
    return (cheerio.load( _html ));
};

// 解析电影详情网页内容
function filterMovies ( html ) {
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
        title: title,
        introduce: introduce,
        download: download
    };

    printData(movie);
};

// 打印影片数据
function printData (movie) {
    console.log('标题：' + movie.title + '\n');
    console.log(movie.introduce + '\n');
    console.log(movie.download + '\n');
}

