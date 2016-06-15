'use strict'

var gulp = require('gulp');
var del = require('del');


/** 
 *  清理生产目录文件
 */
gulp.task('clean', function(cb) {
    del(['./dist']).then(paths => {
        console.log('Deleted files and folders:\n', paths.join('\n'));
        cb();
    });
});

