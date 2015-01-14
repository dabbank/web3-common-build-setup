var plugins = {}
var exportObject = {};

exportObject.errorPipe = function () {
    plugins.plumber = plugins.plumber || require('gulp-plumber');
    plugins.notify = plugins.notify || require('gulp-notify');

    return plugins.plumber({
        errorHandler: plugins.notify.onError({
            title: 'ERROR in <%= error.plugin %>',
            message: '<%= error.message %>'
        })
    });
};

module.exports = exportObject;