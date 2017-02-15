var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');

// 用 nodemon 启动 express 应用
gulp.task('nodemon', function(){
    var stream = nodemon({
        script: './bin/www'
      , ext: 'js html'
      , env: { 'NODE_ENV': 'development'}
    });
    
    // nodemon重启服务之后刷新浏览器
    stream.on('start', function(){
        browserSync.reload();
    })
});


// 默认任务
gulp.task('default', ['nodemon'], function(){
    // 前端文件组
    var files = [
          'app/**/*.*'
        , 'config/**/*.*'
        , 'routes/**/*.*'
    ]

    // 初始化浏览器同步刷新工具，
    browserSync.init(files, {
         proxy: 'http://localhost:3000' //设置代理为 express 的访问地址，
       , browser: 'chrome' //打开 chrome 浏览器
       , notify: false
       , port: 4000     // 端口为 4000
    })

    gulp.watch(files).on("change", browserSync.reload); 

    console.log('gulp is ready!');
})