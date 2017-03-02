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
var phantom = require('phantom');
var Spider = require('../models/spider');

// var mongoose = require('mongoose');
// var Schema = mongoose.Schema;
// var ObjectId = Schema.Types.ObjectId;

var i = 0;
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
    var id = req.params.id;
    var baseUrl;// = req.body.spider.baseUrl ||'http://www.dy2018.com';
    var listTag = ''; //req.body.spider.listTag || '/i/';
    var titleTag = '.title_all h1';
    var maxNumber = 1;// = req.body.spider.maxNumber || 1;

    var spider = {};

    Spider.findById(id, (err, _spider) => {
        if (err) {
            console.log(err);
            return;
        }

        spider = _spider;
        baseUrl = spider.baseUrl;
        maxNumber = spider.maxNumber;
        listTag = spider.listTag;

        getPageAsync ( spider.url )
            .then ( parseList, onError)
            .then ( fetchListArray, onError)
            .then ( onSuccess )
    })


    // 解析列表, 并保存至数组
    function parseList ( html ) {
        console.log('开始解析列表');
        var $ = decodeHtml(html);
        var listArray = [];
        var _listItemUrl = '';
        var i = 0;
        $( spider.listContainer ).each( function (){
            if ( i >= maxNumber ) return false;
            i++;
            _listItemUrl = $(this).attr('href');
            if ( listTag === _listItemUrl.substr(0, listTag.length) ){
                console.log(_listItemUrl);
                listArray.push( baseUrl + _listItemUrl );
            }
        });

        return listArray;
    };

    // 依次爬取数组中的地址
    function fetchListArray( listArray ) {
        console.log('依次爬取列表数组');
        listArray.forEach( url => {
            getPageAsync ( url )
                .then ( parseMovie )
                .then ( movie => {
                    if (movie) {
                        movieController.saveMovie(movie);
                    }
                }, onError)
                .then ( ()=> {
                    console.log('保存成功')
                    // res.redirect('/admin/movie/list');
                }) 
        })
    }

    function onError(err) {
        console.log('抓取网页时出错：\n' + err);
        res.render('spider', {
            title: '爬虫出错'
            , spider: spider
        })
    }

    function onSuccess() {
        console.log('完成抓取');
        res.redirect('/admin/movie/list');
    }

    // 解析电影详情网页内容，返回一个JSON
    function parseMovie ( html ) {
        console.log('开始解析影片详情页面')
        var title, name = '', oldName, year, country, language, type, subtitle, imdb, douban, 
            format, videoSize, fileSize, videoLength, director, starring, intro, poster, imgs, download;
        var starring = [], awards = [], catetorys = [];
        var movie = {};

        var $ = decodeHtml(html);
        title = $(titleTag).text().trim();
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
    
}

function showMovie( movie ){
    
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

        var sitepage = null;
        var phInstance = null;

        phantom.create()
            .then(instance => {
                phInstance = instance;
                return instance.createPage();
            })
            .then(page => {
                sitepage = page;
                return page.open( url ); 
            })
            .then( status => {
                console.log(status);
                return sitepage.property('content');
            })
            .then(content => {
                // console.log(content);
                console.log('抓取成功：' + url);
                resolve( content );
                sitepage.close();
                phInstance.exit();
            })
            .catch(err => {
                console.log('抓取失败！' + url);
                reject(err);
                phInstance.exit();
            })
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

    Spider
        .find()
        .exec((err, spiders) => {
            if (err) handleError(err);
            
            var results = spiders.slice((page - 1) * rows, page * rows );
            res.render('spider_list', {
                title: "爬虫方案列表"
                , spiders: results
                , currentPage: page
                , totalPage: Math.ceil( spiders.length / rows)
                , rows: rows
            })
        })
}

function handleError (err) {
    console.log(err);
}


exports.new = function(req, res) {
    res.render('spider', {
        title: '创建一个新爬虫'
        , spider: {} 
    })

    return;

    var id = req.query.id;
    if (id) {
        console.log('显示爬虫方案：' )
        Spider
            .findById(id, (err, spider) => {
                console.log(spider);
                res.json({ 
                    title: spider.title, 
                    url: spider.url, 
                    baseUrl: spider.baseUrl, 
                    listContainer: spider.listContainer, 
                    listTag: spider.listTag, 
                    maxNumber: spider.maxNumber, 
                    success: 1 });
            })

    } else {
        console.log('新建爬虫方案：' )
        Spider
            .find()
            .exec((err, spiders) => {
                if (err) handleError(err);
                res.render('spider', {
                    title: '创建一个新爬虫'
                    , spiders: spiders 
                })
            })
    }
  var id = req.query.id;
  if (id) {
    Spider
        .findById(id, (err, spider) => {
            if (err) handleError(err);
            res.render('spider', {
                title: '创建一个新爬虫'
                , spider: spider 
            })
        })
  }
}

//list delete spider
exports.del = (req, res) => {
  var id = req.query.id;
  if (id) {
    Spider.remove({ _id: id }, (err, spider) => {
      if (err) {
        console.log(err);
        return;
      }
      res.json({ success: 1 });
    })
  }
}

// 保存spider方案到数据库
exports.save = (req, res) => {
    var spiderObj = req.body.spider;
    var id = spiderObj._id;

    if (id) {
        // 更新已有爬虫方案
        Spider.findByIdAndUpdate(id, spiderObj, (err, spider) =>{
            if (err){
                console.log(err);
                return;
            }
            console.log('爬虫方案已更新：' + spiderObj.title);
            res.redirect('../spider/list');
        })
    } else {
        // 创建一个新爬虫
        var spider = new Spider(spiderObj);
        spider.save((err, spider) => {
            if (err) {
                console.log(err);
                return;
            }
            console.log('spider保存成功')
            res.redirect('../spider/list');
        });
    }
}

exports.show = function(req, res) {
    var id = req.query.id;
    console.log(id);
    if (id) {
    }

}

//admin update spider
exports.update = (req, res) => {
  var id = req.params.id;
  console.log(id);
  if (id) {
    Spider.findById(id, (err, spider) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(spider);
        res.render('spider', {
          title: '爬虫方案更新页',
          spider: spider
        })
    })
  }
}
