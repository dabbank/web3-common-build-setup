/* START SASS */
var gulp = require("gulp");

var pathToBuildConfig = "../../config/build_config.js";

var CONFIG = CONFIG || require(pathToBuildConfig);

var svgSrcFiles = CONFIG.SRC.SPRITES_IMG_BASE_FOLDER() + CONFIG.FILE_TYPE_MACHER.SVG();
var plugins = plugins || {};

var spritesTask = "./sprites";

var compileSass = function (environment) {
    plugins.sass = plugins.sass || require("gulp-sass");
    //gulp.src(CONFIG.SRC.THIRDPARTY.FONTS())
    //    .pipe(gulp.dest(CONFIG.DIST.DEV_FOLDER() + "css"));
    console.log("Compiling sass files..");
    return gulp.src(CONFIG.SRC.SASS_FILES())
        .pipe(plugins.sass({
            precision: 8,
            errLogToConsole: true
        }));
};


var performCSS = function(){
    plugins.gulpMerge = plugins.gulpMerge || require('gulp-merge');
    plugins.gulpFilter = plugins.gulpFilter || require('gulp-filter');
    plugins.concat = plugins.concat || require('gulp-concat');

    var myFilter = plugins.gulpFilter("**/*.css");
    //  To prevent async issues & writing to temp files, we need to write to memory stream
    return plugins.gulpMerge(
        require(spritesTask).generateSprites(svgSrcFiles),
        compileSass()
    )
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
    performCSS : performCSS
}