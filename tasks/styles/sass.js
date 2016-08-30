var gulp = require("gulp");

var pathToBuildConfig = "../../config/build_config.js";
var CONFIG = CONFIG || require(pathToBuildConfig);

//var svgSrcFiles = CONFIG.SRC.SPRITES_IMG_BASE_FOLDER() + CONFIG.FILE_TYPE_MACHER.SVG();
var plugins = plugins || {};


var compileSass = function () {
    /*
     TODO use instead
     */
    plugins.sass = plugins.sass || require("gulp-sass");
    return gulp.src(CONFIG.SRC.SASS_FILES())
        .pipe(plugins.sass({
            precision: 8,
            errLogToConsole: true
            //  outputStyle: "compressed"
        }))
        ;
};

var performCSS = function (environment) {
    var through = require('through2');
    plugins.noop = function () {
        return through.obj();
    };
    plugins.gulpFilter = plugins.gulpFilter || require('gulp-filter');
    plugins.concat = plugins.concat || require('gulp-concat');

    plugins.gulpIf = plugins.gulpIf || require("gulp-if");

    plugins.cleanCSS = (environment === CONFIG.GULP.PROD) ? require("gulp-clean-css") : plugins.noop;

// TODO still required?
    var myFilter = plugins.gulpFilter("**/*.css");
    //  To prevent async issues & writing to temp files, we need to write to memory stream
    return compileSass()
        .pipe(myFilter)
        // concat sprites.css with bootstrap.css
        .pipe(plugins.concat("css/main.css"))
        .pipe(myFilter.restore())
        .pipe(plugins.gulpIf(environment === CONFIG.GULP.PROD,
            plugins.cleanCSS(
                {
                    debug: false
                }, function (details) {
                    console.log(details.name + ': ' + details.stats.originalSize);
                    console.log(details.name + ': ' + details.stats.minifiedSize);
                }
            )))
        ;
};


// TODO use general function
var getEnvironmentPath = function (env) {
    var ENV_PATH_ROOT = (env === "dev") ? CONFIG.DIST.DEV_FOLDER() : CONFIG.DIST.DIST_FOLDER();
    return ENV_PATH_ROOT + CONFIG.DIST.ROOT_PREFIX_PATH();
};
/* END SASS */

module.exports = {
    performCSS: performCSS
}