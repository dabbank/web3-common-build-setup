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

var initGulp = function (gulp, CONFIG) {

    if (!CONFIG) {
        CONFIG = require("./build_config.js");
    }

    var plugins = {};
    plugins.template = require("gulp-template");
    plugins.concat = require("gulp-concat");
    plugins.tsc = require("gulp-tsc");

    plugins.ngHtml2js = require("gulp-ng-html2js");

    // TODO use instead of watchgulp
    plugins.watch = require("gulp-watch");
    plugins.rename = require("gulp-rename");

    var npms = {};
    var gulp_utils = require("./gulp_utils");

    var partials = {};
    partials.errorPipe = gulp_utils.errorPipe;

    var del = require("del");
    var child_process = require("child_process");
    var _ = require("lodash");
    var fs = require("fs");

    // default by convention of gulp
    gulp.task("default", ["dev"]);
    // "prod:jslibs", moved to global-libs
    gulp.task("prod:once", ["prod"]);
    gulp.task("prod", ["prod:init-app", "prod:tscompile", "templates"]); // use prod only
    gulp.task("dev", ["devFromCommon"]);//"openBrowser" "tscopysrc"
    gulp.task("devFromCommon", ["dev:once", "webserver", "watch"]);
    // "cleanTarget",
    gulp.task("dev:once", ["dev:init-app", "js-thirdparty", "mocks", "resources", "tscompile", "tscompiletests", "templates", "styles"]);

    gulp.task("watch", function (cb) {
        gulp.watch(CONFIG.SRC.TS.TS_FILES(), ["tscompile"]);
        gulp.watch(CONFIG.SRC.TS.TS_UNIT_TEST_FILES(), ["tscompiletests"]);
        gulp.watch(CONFIG.SRC.ALL_HTML_TEMPLATES(), ["templates"]);
    });

    // Example tasks to test inheritance
    gulp.task("echo", function () {
        console.log("ECHO!!!!!!" + CONFIG.DEV.ABSOLUTE_FOLDER());
    });

    // TODO consider refactor to separate file
    gulp.task("styles", function () {

        plugins.sass = plugins.sass || require("gulp-sass");

        gulp.src(CONFIG.SRC.THIRDPARTY.FONTS())
            .pipe(gulp.dest(CONFIG.DIST.DEV_FOLDER() + "css"));

        gulp.src(CONFIG.DEV_FOLDER.SASS() + "main.scss")
            .pipe(plugins.sass({
                precision: 8,
                errLogToConsole: true
            }))
            .pipe(gulp.dest(CONFIG.DIST.DEV_FOLDER() + "css"));
    });

    // TODO not used yet
    gulp.task("cleanTarget", function (callback) {
        del(["target"], callback);
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

    gulp.task("dev:init-app", function (cb) {
        gulp.src(CONFIG.SRC.INIT_APP_TEMPLATE())
            .pipe(plugins.template({
                    ngDeps: CONFIG.DEV.NG_MODULE_DEPS()
                },
                {
                    interpolate: /<%gulp=([\s\S]+?)%>/g,
                    evaluate: /<%gulp([\s\S]+?)%>/g
                }))
            .pipe(plugins.rename("initapp.ts"))
            .pipe(gulp.dest(CONFIG.DEV_FOLDER.SRC() + "app"))
            .on('error', cb);
        cb();
    });

    gulp.task("prod:init-app", function (cb) {
        gulp.src(CONFIG.SRC.INIT_APP_TEMPLATE())
            .pipe(plugins.template({
                    ngDeps: function () {
                        return [''];
                    }
                },
                {
                    interpolate: /<%gulp=([\s\S]+?)%>/g,
                    evaluate: /<%gulp([\s\S]+?)%>/g
                }))
            .pipe(plugins.rename("initapp.ts"))
            .pipe(gulp.dest(CONFIG.DEV_FOLDER.SRC() + "app"))
            .on('error', cb);
        cb();
    });

    gulp.task("js-app", function () {
        gulp.src(CONFIG.SRC.JS.FILES())
            .pipe(partials.errorPipe())
            .pipe(plugins.concat(CONFIG.DIST.JS.FILES.APP()))
            .pipe(gulp.dest(CONFIG.DIST.JS.DEV_FOLDER()));
    });

    var performTemplating = function(targetFolder, cb){

        function performTemplatingAtBuildTime(targetFolder) {

            var frameContentFileContent = "";
            try {
                frameContentFileContent = fs.readFileSync(CONFIG.PARTIALS.MAIN());
            }catch (err) {
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
                    content: frameContentFileContent
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
    gulp.task("templates", function (cb) {
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

        var startPathToOpenBrowser = CONFIG.DYNAMIC_META.ROOT_IDENTIFIER() + CONFIG.DYNAMIC_META.MODULE_NAME() + "/index.html";
        plugins.browserSync.init(filesToWatch, {
            server: {
                baseDir: CONFIG.DEV.WEBSERVER_BASE_ROOT_DIRS()
            },
            startPath: startPathToOpenBrowser
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

    // TODO unused, better use tsdocs
    gulp.task('ngdocs', [], function () {
        plugins.ngdocs = require("gulp-ngdocs");
        var options = {
            html5Mode: true,
            startPage: '/api',
            title: "My Awesome Docs",
            image: "path/to/my/image.png",
            imageLink: "http://my-domain.com",
            titleLink: "/api"
        }
        return gulp.src(CONFIG.DIST.DEV_FOLDER() + CONFIG.DIST.JS.FILES.APP())
            .pipe(plugins.ngdocs.process(options))
            .pipe(gulp.dest(CONFIG.CI.DOCS_FOLDER()));
    });

    return gulp;
};

module.exports.initGulp = initGulp;
module.exports.depsFolder = __dirname + '/node_modules/';
module.exports.buildConfig = require('./build_config.js');
