var gulp = require("gulp");

var pathToBuildConfig = "../../config/build_config.js";
var CONFIG = CONFIG || require(pathToBuildConfig);

var svgSrcFiles = CONFIG.SRC.SPRITES_IMG_BASE_FOLDER() + CONFIG.FILE_TYPE_MACHER.SVG();
var plugins = plugins || {};

//var spritesTask = "./sprites";

var compileSass = function (environment) {
    /*
     TODO use instead
     */
    plugins.postcss = plugins.postcss || require('gulp-postcss');
    // plugins.precss = plugins.precss || require('precss');
    plugins.autoprefixer = plugins.autoprefixer || require('autoprefixer');
    //var mqpacker = require('css-mqpacker');
    //var csswring = require('csswring');
    plugins.sass = plugins.sass || require("gulp-sass");
    //gulp.src(CONFIG.SRC.THIRDPARTY.FONTS())
    //    .pipe(gulp.dest(CONFIG.DIST.DEV_FOLDER() + "css"));

    var processors = [
        plugins.autoprefixer(
            {
                browsers: ['last 1 version']
            }
        ),
        // plugins.precss()
        //  ,mqpacker,
        //  csswring
    ];

    return gulp.src(CONFIG.SRC.SASS_FILES())
        .pipe(plugins.sass({
            precision: 8,
            errLogToConsole: true
        }))
        .pipe(plugins.postcss(processors));
};

var performCSS = function () {
    plugins.gulpMerge = plugins.gulpMerge || require('gulp-merge');
    plugins.gulpFilter = plugins.gulpFilter || require('gulp-filter');
    plugins.concat = plugins.concat || require('gulp-concat');

    var myFilter = plugins.gulpFilter("**/*.css");
    //  To prevent async issues & writing to temp files, we need to write to memory stream
    return compileSass()
        .pipe(myFilter)
        // concat sprites.css with bootstrap.css
        .pipe(plugins.concat("css/main.css"))
        .pipe(myFilter.restore());
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