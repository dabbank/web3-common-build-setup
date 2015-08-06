// CONFIG.SRC.SASS_TARGET_FOLDER() + recursive

//gulpInstanceToOverride.src("bower_components/mobile-boilerplate/css/normalize.css")
//    .pipe(plugins.gulpIf(isProdEnvironment, plugins.minifyCss()))
//    .pipe(gulp.dest(ENV_PATH_ROOT + "/css"));

var compileSass = function(environment){
    plugins.sass = plugins.sass || require("gulp-sass");
    //gulp.src(CONFIG.SRC.THIRDPARTY.FONTS())
    //    .pipe(gulp.dest(CONFIG.DIST.DEV_FOLDER() + "css"));

    return gulp.src(CONFIG.SRC.SASS_MAIN())
        .pipe(plugins.sass({
            precision: 8,
            errLogToConsole: true
        }));
};

gulp.task("styles:dev", function () {

    var myFilter = plugins.gulpFilter("**/*.css");
    //  To prevent async issues & writing to temp files, we need to write to memory stream
    plugins.gulpMerge(
        require("./tasks/sprites_img/sprites").generateSprites(),
        compileSass())
        .pipe(myFilter)
        // concat sprites.css with bootstrap.css
        .pipe(plugins.concat("css/main.css"))
        .pipe(myFilter.restore())
        .pipe(gulp.dest(getEnvironmentPath("dev")));
});

// TODO
gulp.task("styles:prod", function () {
    //compileSass(getEnvironmentPath("prod"));
    // require("./tasks/sprites_img/sprites").generateSprites(getEnvironmentPath("prod"));
});