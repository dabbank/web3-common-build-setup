// TODO unused
var plugins = {};
var gulp = require("gulp");

gulp.task('tsd', function (callback) {
    plugins.tsd = require('gulp-tsd');

    plugins.tsd({
        command: 'reinstall',
        config: './../config/tsd.json'
    }, callback);
});




