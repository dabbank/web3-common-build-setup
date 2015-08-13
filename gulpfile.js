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

    plugins.typescript = require("gulp-typescript");
    plugins.gulpIf = require("gulp-if");
    plugins.ngHtml2js = require("gulp-ng-html2js");
    plugins.runSequence = require("run-sequence").use(gulp);

    var npms = {};
    var gulp_utils = require("./tasks/common/gulp_catch_error");
    var partials = {};
    partials.errorPipe = gulp_utils.errorPipe;

    // Running gulp in command line will execute this:
    gulp.task("default", function () {
        showHelpMessageToConsole();
    });

    // TODO make usable in async gulp mode. at the moment you have to run it custom by yourself
    gulp.task("clean", function (callback) {
        plugins.del = plugins.del || require("del");
        plugins.del([CONFIG.DIST.DEV_FOLDER(), CONFIG.DIST.DIST_FOLDER()], callback);
    });

    gulp.task("prod:once", ["prod"]);
    gulp.task("prod", ["prodFromCommon"]); // use prod only
    gulp.task("prodFromCommon", ["prod:tscompile", "prod:copyStaticFiles", "templates:prod"]);

    gulp.task("dev", ["devFromCommon"]);//"openBrowser" "tscopysrc"
    gulp.task("devFromCommon", ["dev:once", "dev:copyStaticFiles", "webserver", "watch"]);
    gulp.task("dev:once", ["tscompile", "tscompiletests", "templates"]);
    gulp.task("templates", ["templates:dev"]);

    gulp.task("watch", function (cb) {
        plugins.gwatch = require("gulp-watch");

        plugins.gwatch(CONFIG.SRC.TS.TS_FILES(), function () {
            plugins.runSequence(["tscompile"]);
        }, cb);
        plugins.gwatch(CONFIG.SRC.TS.TS_UNIT_TEST_FILES(), function () {
            plugins.runSequence(["tscompiletests"]);
        }, cb);
        plugins.gwatch(CONFIG.SRC.ALL_HTML_TEMPLATES(), function () {
            plugins.runSequence(["templates"]);
        }, cb);
    });

    gulp.task("dev:copyStaticFiles", function () {
        copyThirdPartyJS("dev");
        copyResources(getEnvironmentPath("dev"));
    });
    gulp.task("prod:copyStaticFiles", function () {
        copyThirdPartyJS("prod");
        copyResources(getEnvironmentPath("prod"));
    });

    function copyThirdPartyJS(env) {
        plugins.uglify = plugins.uglify || require("gulp-uglify");
        plugins.concat = require("gulp-concat");

        // , "bower_components/mobile-boilerplate/js/helper.js",
        gulp.src(CONFIG.SRC.JS.LIBS())
            .pipe(partials.errorPipe())
            .pipe(plugins.gulpIf(env === "prod", plugins.uglify()))
            .pipe(plugins.concat("libs.js"))
            .pipe(gulp.dest(CONFIG.DEV_FOLDER.DEV_OR_DIST_ROOT(env)))

        gulp.src(CONFIG.SRC.JS.SINGLE_LIBS())
            .pipe(partials.errorPipe())
            .pipe(plugins.gulpIf(env === "prod", plugins.uglify()))
            .pipe(gulp.dest(CONFIG.DEV_FOLDER.DEV_OR_DIST_ROOT(env)));
        ;
    };

    // TODO generalize
    var getEnvironmentPath = function (env) {
        var ENV_PATH_ROOT = (env === "dev") ? CONFIG.DIST.DEV_FOLDER() : CONFIG.DIST.DIST_FOLDER();
        return ENV_PATH_ROOT + CONFIG.DIST.ROOT_PREFIX_PATH();
    };

    var copyResources = function(ENV_PATH_ROOT){
        gulp.src("src/mocks/**/*")
            .pipe(gulp.dest(ENV_PATH_ROOT + "mocks/"));

        gulp.src("src/img/**/*")
            .pipe(gulp.dest(ENV_PATH_ROOT + "img/"));
    };

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

    var performTemplating = function (targetFolder, cb) {

        function performTemplatingAtBuildTime(targetFolder) {
            plugins.template = require("gulp-template");
            npms.fs = npms.fs || require("fs");

            var frameContentFileContent = "";
            try {
                frameContentFileContent = npms.fs.readFileSync(CONFIG.PARTIALS.MAIN());
            } catch (err) {
                console.log("Warning: " + CONFIG.PARTIALS.MAIN() + " not found " + err);
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
            plugins.concat = require("gulp-concat");

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
        var filters = {};


        return gulp.src(tsfiles.concat(CONFIG.DEV_FOLDER.THIRDPARTY_TS_REFERENCE_FILE()))
            .pipe(partials.errorPipe())
            .pipe(plugins.typescript(
                {
                    //allowBool: true,
                    out: CONFIG.DIST.JS.FILES.APP(),
                    sortOutput : true
                    //sourcemap: doUseSourceMaps,
                    //sourceRoot: doUseSourceMaps ? "/" : null,
                    //target: ecmaScriptVersion

                })
            //    , filters, "longReporter"
        )
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
            .pipe(plugins.typescript(
                {
                    allowBool: true,
                    out: "tests.js",
                    // tmpDir : "./ts_tmp",
                    // sourcemap: true,
                    // sourceRoot: "/",
                    target: "ES5"
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

    // TODO use tsdocs


    var showHelpMessageToConsole = function(){
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
    };

    return gulp;
};

module.exports.initGulp = initGulp;
module.exports.depsFolder = __dirname + '/node_modules/';
module.exports.buildConfig = require(pathToBuildConfig);


var gulpUtils = require("./tasks/common/gulp_catch_error");
module.exports.partials = {"gulp_utils": gulpUtils};
