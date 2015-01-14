var plugins = {};

var gulp = require("gulp");

gulp.task('tsd', function (callback) {
    plugins.tsd = require('gulp-tsd');

    plugins.tsd({
        command: 'reinstall',
        config: './tsd.json'
    }, callback);
});


