'use strict'

var gulp = require('gulp'),
    webpack = require('webpack'),
    del = require('del');

var config = require('./webpack.config');

/** 
 *  清理生产目录文件
 */
gulp.task('clean', function(cb) {
    del(['./dist']).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
        cb();
    });
});

/** 
 *  执行webpack打包
 */
gulp.task('webpack',['clean'], function(cb) {
    webpack(config, cb)
});

gulp.task('default', ['webpack'], function() {
    console.log(process.env.NODE_ENV);
})
