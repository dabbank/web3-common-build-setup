/**
 * Understand gulp http://code.tutsplus.com/tutorials/managing-your-build-tasks-with-gulpjs--net-36910
 */
/**
 * npm install npm-check-updates -g
 */

/**
 * TODO distinguish in file between CI only tasks
 * because of longer initial times by require statements and clean code
 * gulp --gulpfile mygulpfile.js
 */

var pathToBuildConfig = "./config/build_config.js";

var initGulp = function (gulp, CONFIG) {

    CONFIG = CONFIG || require(pathToBuildConfig);

    var plugins = {};
    plugins.template = require("gulp-template");
    plugins.concat = require("gulp-concat");
    plugins.tsc = require("gulp-tsc");
    plugins.gulpIf = require("gulp-if");
    plugins.ngHtml2js = require("gulp-ng-html2js");

    plugins.gulpMerge = require('gulp-merge');
    plugins.gulpFilter = require('gulp-filter');

    // TODO use instead of watchgulp

    //plugins.rename = require("gulp-rename");

    var npms = {};
    var gulp_utils = require("./tasks/common/gulp_catch_error");

    var partials = {};
    partials.errorPipe = gulp_utils.errorPipe;


    var child_process = require("child_process");
    var _ = require("lodash");


    // default by convention of gulp
    gulp.task("default", function(){
        process.stdout.write("\nUse\n");
        process.stdout.write("gulp dev\n");
        process.stdout.write("to start interactive development mode. src files will be watched and dev_target build. webserver connects to dev_target\n");
        process.stdout.write("------------------\n");
        process.stdout.write("Use\n");
        process.stdout.write("gulp prod\n");
        process.stdout.write("to generate production files, and commit to versioning system. src files will be generated to dist_target\n");
        process.stdout.write("------------------\n");
        process.stdout.write("Use\n");
        process.stdout.write("gulp help\n");
        process.stdout.write("for howto - TODO\n");
    });
    // "prod:jslibs", moved to global-libs
    gulp.task("prod:once", ["prod"]);
    gulp.task("prod", ["prodFromCommon"]); // use prod only
    gulp.task("prodFromCommon", ["prod:tscompile", "prod_STATICS", "templates:prod", "styles:prod"]);

    gulp.task("dev", ["devFromCommon"]);//"openBrowser" "tscopysrc"
    gulp.task("devFromCommon", ["dev:once", "dev_STATICS", "webserver", "watch"]); // TODO clean
    gulp.task("dev:once", ["js-thirdparty", "mocks", "resources", "tscompile", "tscompiletests", "templates", "styles:dev"]);

    gulp.task("templates", ["templates:dev"]);

    gulp.task("watch", function (cb) {
        plugins.watch = plugins.watch || require("gulp-watch");
        gulp.watch(CONFIG.SRC.TS.TS_FILES(), ["tscompile"]);
        gulp.watch(CONFIG.SRC.TS.TS_UNIT_TEST_FILES(), ["tscompiletests"]);
        gulp.watch(CONFIG.SRC.ALL_HTML_TEMPLATES(), ["templates"]);
    });

    // Example tasks to test inheritance
    gulp.task("echo", function () {
        console.log("ECHO!!!!!!" + CONFIG.DEV.ABSOLUTE_FOLDER());
    });


    gulp.task("dev_STATICS", function(){
        copyThirdPartyJS("dev");
    });
    gulp.task("prod_STATICS", function(){
        copyThirdPartyJS("prod");
    });

    function copyThirdPartyJS(env) {
        plugins.uglify = plugins.uglify || require("gulp-uglify");

        //gulpInstanceToOverride.src("bower_components/mobile-boilerplate/css/normalize.css")
        //    .pipe(plugins.gulpIf(isProdEnvironment, plugins.minifyCss()))
        //    .pipe(gulp.dest(ENV_PATH_ROOT + "/css"));
        // , "bower_components/mobile-boilerplate/js/helper.js",
        gulp.src(CONFIG.SRC.JS.LIBS())
            .pipe(partials.errorPipe())
            .pipe(plugins.gulpIf(env === "prod", plugins.uglify()))
            .pipe(plugins.concat("libs.js"))
            .pipe(gulp.dest(CONFIG.DEV_FOLDER.DEV_OR_DIST_ROOT(env))) //  + "js"

        gulp.src(CONFIG.SRC.JS.SINGLE_LIBS())
            .pipe(partials.errorPipe())
            .pipe(plugins.gulpIf(env === "prod", plugins.uglify()))
            .pipe(gulp.dest(CONFIG.DEV_FOLDER.DEV_OR_DIST_ROOT(env))); //  + "js"
        ;
    };


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


    // TODO generalize
    var getEnvironmentPath = function(env){
        var ENV_PATH_ROOT = (env === "dev") ? CONFIG.DIST.DEV_FOLDER() : CONFIG.DIST.DIST_FOLDER();
        return ENV_PATH_ROOT + CONFIG.DIST.ROOT_PREFIX_PATH();
    };

    // TODO consider refactor to separate file
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

    // TODO not used yet
    gulp.task("cleanTarget", function (callback) {
        plugins.del = plugins.del || require("del");
        del([CONFIG.DIST.DEV_FOLDER()], callback);
    });

    // TODO not used yet
    gulp.task("resources", function () {
        gulp.src(CONFIG.DEV_FOLDER.RESOURCES() + "**/*")
            .pipe(gulp.dest(CONFIG.DIST.DEV_FOLDER()));
    });

    // TODO not used, yet
    // for dev: use the intellij watcher.xml to import
    // See explanations: https://github.com/palantir/tslint
    //            ,"check-lowercase"
    gulp.task("tslint", function () {
        plugins.tslint = plugins.tslint || require('gulp-tslint');
        // TODO cache and move
        var tslintConfig = require("./tslint.json");

        gulp.src(["src/**/*.ts"])
            .pipe(partials.errorPipe())
            .pipe(plugins.tslint({configuration: tslintConfig}))
            .pipe(plugins.tslint.report("verbose"));
    });

    // TODO use with repository not linking instead
    //gulp.task("bump", function () {
    //    plugins.bump = plugins.bump ||require("gulp-bump");
    //    gulp.src("bower_export/bower.json")
    //        .pipe(plugins.bump({version: getBowerJson().version + "+" + Math.random()}))
    //        .pipe(gulp.dest("bower_export/"));
    //});

    // TODO duplicated, ld
    gulp.task("js-thirdparty", function () {
        gulp.src(CONFIG.SRC.JS.LIBS())
            .pipe(plugins.concat(CONFIG.DIST.JS.FILES.LIBS()))
            .pipe(gulp.dest(CONFIG.DIST.DEV_FOLDER() + CONFIG.DIST.ROOT_PREFIX_PATH()));

        gulp.src(CONFIG.SRC.JS.SINGLE_LIBS())
            .pipe(gulp.dest(CONFIG.DIST.ROOT_PREFIX_PATH()));
    });

    // TODO duplicated
    gulp.task("mocks", function () {
        gulp.src(CONFIG.SRC.JS.MOCK_FILES())
            .pipe(gulp.dest(CONFIG.DIST.DEV_FOLDER() + CONFIG.DIST.ROOT_PREFIX_PATH()));
    });

    gulp.task("js-app", function () {
        gulp.src(CONFIG.SRC.JS.FILES())
            .pipe(partials.errorPipe())
            .pipe(plugins.concat(CONFIG.DIST.JS.FILES.APP()))
            .pipe(gulp.dest(CONFIG.DIST.JS.DEV_FOLDER()));
    });

    var performTemplating = function(targetFolder, cb){

        function performTemplatingAtBuildTime(targetFolder) {
            npms.fs = npms.fs || require("fs");

            var frameContentFileContent = "";
            try {
                frameContentFileContent = npms.fs.readFileSync(CONFIG.PARTIALS.MAIN());
            }catch (err) {
                console.log("Warning:"+CONFIG.PARTIALS.MAIN()  not found" + err);
                // If the type is not what you want, then just throw the error again.
                //if (err.code !== 'ENOENT') throw e;
                // Handle a file-not-found error
            }

            gulp.src(CONFIG.DEV.HTML_MAIN())
                .pipe(partials.errorPipe())
                .pipe(
                plugins.template({
                    headFiles: {
                        css: CONFIG.DIST.CSS.HEAD_FILE(),
                        js: CONFIG.DIST.JS.HEAD_FILES()
                    },
                    frameContent: frameContentFileContent
                }, {
                    interpolate: /<%gulp=([\s\S]+?)%>/g,
                    evaluate: /<%gulp([\s\S]+?)%>/g
                })
            )
                .pipe(gulp.dest(targetFolder + CONFIG.DIST.ROOT_PREFIX_PATH()));
        }
        performTemplatingAtBuildTime(targetFolder);
        // Angular templating

        var camelCaseModuleName = CONFIG.DYNAMIC_META.MODULE_NAME().replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });
        // Angular templates, read at runtime
        function angularTemplating(targetFolder) {
            gulp.src(CONFIG.SRC.ANGULAR_HTMLS())
                .pipe(plugins.ngHtml2js({
                    moduleName: camelCaseModuleName + "Templatecache",
                    prefix: "/"
                }))
                .pipe(plugins.concat(CONFIG.DIST.JS.FILES.TEMPLATES()))
                //.pipe(gulp.dest(CONFIG.DIST.DEV_FOLDER()))
                // TODO distinguish between prod and not
                .pipe(gulp.dest(targetFolder + CONFIG.DIST.ROOT_PREFIX_PATH()));

        }
        angularTemplating(targetFolder);

        cb();
    }

    // TODO refactor to split "lodash build templating" and angular templating

    gulp.task("templates:dev", function (cb) {
        var targetFolder = CONFIG.DIST.DEV_FOLDER();
        performTemplating(targetFolder, cb);
    });

    // TODO index should not be delivered to prod
    gulp.task("templates:prod", function (cb) {
        var targetFolder = CONFIG.DIST.DIST_FOLDER();
        performTemplating(targetFolder, cb);
    });


    gulp.task("echo", function () {
        console.log("parent");
    });

    gulp.task("webserver", function () {
        plugins.browserSync = plugins.browserSync || require("browser-sync");

        var recursive = "**/*.*";
        // TODO reduce to minimum
        var filesToWatch = [
            CONFIG.DIST.DEV_FOLDER() + recursive,
            //"../../bower_export/sass/target/**/*",
            CONFIG.SRC.SASS_TARGET_FOLDER() + recursive
        ];

        plugins.browserSync.init(filesToWatch, {
            server: {
                baseDir: CONFIG.DEV.WEBSERVER_BASE_ROOT_DIRS()
            },
            startPath: CONFIG.DEV.WEBSERVER_STARTPATH()
        });
    });

    // TODO only use one tscompile for dev, tests and prod for compact view
    // TODO refactor to dev:tscompile
    function handleJavaScript(tsfiles, doUseSourceMaps, ecmaScriptVersion) {
        console.log(tsfiles);
        return gulp.src(tsfiles.concat(CONFIG.DEV_FOLDER.THIRDPARTY_TS_REFERENCE_FILE()))
            .pipe(partials.errorPipe())
            .pipe(plugins.tsc(
                {
                    allowBool: true,
                    out: CONFIG.DIST.JS.FILES.APP(),
                    sourcemap: doUseSourceMaps,
                    sourceRoot: doUseSourceMaps ? "/" : null,
                    target: ecmaScriptVersion
                }))
            ;
    }

    gulp.task("tscompile", function () {
        var tsSourceFiles = CONFIG.SRC.TS.TS_FILES().concat(CONFIG.SRC.TS.TS_DEFINITIONS());
        var ecmaScriptVersion = "ES5";
        var doUseSourceMaps = true;

        var targetRootFolder = CONFIG.DIST.DEV_FOLDER();
        handleJavaScript(tsSourceFiles, doUseSourceMaps, ecmaScriptVersion)
            .pipe(gulp.dest(targetRootFolder + CONFIG.DIST.ROOT_PREFIX_PATH()));
    });

    // TODO use handleJavaScript ()
    gulp.task("tscompiletests", function () {
        console.log(CONFIG.SRC.TS.TS_UNIT_TEST_FILES());
        var sourceFiles = CONFIG.SRC.TS.TS_UNIT_TEST_FILES().concat(CONFIG.SRC.TS.TS_DEFINITIONS());
        return gulp.src(sourceFiles)
            .pipe(partials.errorPipe())
            .pipe(plugins.tsc(
                {
                    allowBool: true,
                    out: "tests.js",
                    // tmpDir : "./ts_tmp",
                    sourcemap: true,
                    sourceRoot: "/",
                    target: "ES5"
                    //noLib: false
                }))
            .pipe(gulp.dest(CONFIG.DEV.UNIT_TESTS_JS_FOLDER()));
    });

    gulp.task("prod:tscompile", function () {
        plugins.ngAnnotate = plugins.ngAnnotate || require("gulp-ng-annotate");
        plugins.uglify = require("gulp-uglify");

        var ecmaScriptVersion = "ES3";
        var doUseSourceMaps = false;
        var tsfiles = CONFIG.SRC.TS.TS_FILES();

        var targetRootFolder = CONFIG.DIST.DIST_FOLDER();
        handleJavaScript(tsfiles, doUseSourceMaps, ecmaScriptVersion)
            .pipe(plugins.ngAnnotate())
            .pipe(plugins.uglify())
            .pipe(gulp.dest(targetRootFolder + CONFIG.DIST.ROOT_PREFIX_PATH()));
    });

    // TODO refactor CI only tasks to separate file

    // Run unit test once and exit
    gulp.task("test", function (done) {
        // TODO strategy to run tests separated
        npms.karma = npms.karma || require("karma").server; // TODO move server call to later
        npms.karma.start({
            // "/node_modules/web3-common-build-setup/"+
            configFile: CONFIG.DEV.KARMA_CONFIG(),
            // Override specific config from file
            singleRun: true
            //browsers: ["PhantomJS"]
        }, done);
    });

    // If not started in chromeOnly-mode, need to start selenium first
    // TODO switch for non chromeOnly mode
    gulp.task("protractor", function () {
        npms.protractor = npms.protractor || require("gulp-protractor").protractor;

        // TODO must be in sync with specs of protractor
        //var srcNeeededForIntegrTest = "src/**/*.js";
        gulp.src([
//            CONFIG.DEV.UI_TEST_FILES()
            // CONFIG.DEV.ABSOLUTE_FOLDER()+"features/**/*.feature"
        ])
            .pipe(npms.protractor({
                //options : {
                configFile: CONFIG.DEV.PROTRACTOR_CONFIG()
                //args: {
                //    "specs" : ["whoo.js"]
                //}
                //}
            }))
            .on("error", function (e) {
                console.log(JSON.stringify(e));
                throw e;
            });
    });

    // TODO used for CI and other browsers, atm chromeOnly mode is used to be fast
    gulp.task("seleniumServer", function () {
        var webdriverPath = __dirname + "node_modules\\chromedriver\\lib\\chromedriver\\chromedriver.exe";
        var command = "java -jar " + __dirname + "\\node_modules\\selenium-server-standalone-jar\\jar\\selenium-server-standalone-2.40.0.jar -Dwebdriver.chrome.driver=" + webdriverPath;
        exec(command, function (status, output) {
            console.log("Exit status:", status);
            console.log("Program output:", output);
        });
    });

    // TODO use tsdocs

    return gulp;
};

module.exports.initGulp = initGulp;
module.exports.depsFolder = __dirname + '/node_modules/';
module.exports.buildConfig = require(pathToBuildConfig);


var gulpUtils = require("./tasks/common/gulp_catch_error");
module.exports.partials = {"gulp_utils" : gulpUtils};
