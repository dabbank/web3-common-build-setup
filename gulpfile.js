/**
 * Understand gulp http://code.tutsplus.com/tutorials/managing-your-build-tasks-with-gulpjs--net-36910
 */
/**
 * npm install npm-check-updates -g
 */

var pathToBuildConfig = "./config/build_config.js";

var initGulp = function (gulp, CONFIG) {

    CONFIG = CONFIG || require(pathToBuildConfig);


    var plugins = {};
    var through = require('through2');
    plugins.noop = function () {
        return through.obj();
    };

// TODO REVIEW: move to where it is used. prevent double require in multiple files due to performance
    plugins.typescript = require(CONFIG.GULP.TYPESCRIPT);
    plugins.gulpIf = require(CONFIG.GULP.GULPIF);
    plugins.ngHtml2js = require(CONFIG.GULP.HTML2JS);

    var npms = {};
    var gulp_utils = require(CONFIG.GULP.PATH.CATCH_ERROR_JS);
    var partials = {};
    partials.errorPipe = gulp_utils.errorPipe;

    // Running gulp in command line will execute this:
    gulp.task(CONFIG.GULP.TASK.DEFAULT, function () {
        CONFIG.GULP.SHOW_HELP_MESSAGE_TO_CONSOLE();
    });

    // TODO make usable in async gulp mode. at the moment you have to run it custom by yourself
    gulp.task(CONFIG.GULP.TASK.CLEAN, function (callback) {
        plugins.del = plugins.del || require(CONFIG.GULP.DEL);
        plugins.del([CONFIG.DIST.DEV_FOLDER(), CONFIG.DIST.DIST_FOLDER()], callback);
    });

    gulp.task(CONFIG.GULP.PROD_ONCE, [CONFIG.GULP.PROD]);
    gulp.task(CONFIG.GULP.PROD, [CONFIG.GULP.PROD_FROM_COMMON]);
    gulp.task(CONFIG.GULP.PROD_FROM_COMMON, [CONFIG.GULP.PROD_TSCOMPILE, CONFIG.GULP.PROD_COPY_STATIC_FILES, CONFIG.GULP.PROD_TEMPLATES, CONFIG.GULP.PROD_STYLES]);

    gulp.task(CONFIG.GULP.DEV, [CONFIG.GULP.DEV_FROM_COMMON]);
    gulp.task(CONFIG.GULP.DEV_FROM_COMMON, [CONFIG.GULP.DEV_ONCE, CONFIG.GULP.DEV_COPY_STATIC_FILES, "dev:concatlibs", CONFIG.GULP.DEV_WEBSERVER, CONFIG.GULP.TASK.WATCH]);
    // CONFIG.GULP.TS_COMPILE_TESTS, 
    gulp.task(CONFIG.GULP.DEV_ONCE, [CONFIG.GULP.TSLINT, CONFIG.GULP.TSCOMPILE, CONFIG.GULP.DEV_TEMPLATES, CONFIG.GULP.DEV_STYLES, CONFIG.GULP.DEV_COPY_STATIC_FILES]);

    gulp.task(CONFIG.GULP.DEV_COPY_STATIC_FILES, function () {
        copyResources(getEnvironmentPath(CONFIG.GULP.DEV));
    });

    gulp.task("dev:concatlibs", function () {
        plugins.uglify = plugins.noop;
        copyThirdPartyJS(CONFIG.GULP.DEV);
    });

    gulp.task(CONFIG.GULP.PROD_COPY_STATIC_FILES, function () {
        plugins.uglify = plugins.uglify || require(CONFIG.GULP.GULP_UGLIFY);
        copyThirdPartyJS(CONFIG.GULP.PROD);
        copyResources(getEnvironmentPath(CONFIG.GULP.PROD));
    });

    gulp.task(CONFIG.GULP.TASK.WATCH, function (cb) {

        plugins.runSequence = plugins.runSequence || require(CONFIG.GULP.PLUGINS_RUNSEQUENCE).use(gulp);
        plugins.gwatch = plugins.gwatch || require(CONFIG.GULP.GULP_WATCH);

        plugins.gwatch(CONFIG.DIST.DEV_FOLDER() + "**/*.js").on('change', plugins.browserSync.reload);
// performance: , CONFIG.GULP.PATH.GWATCH_MOCKS
        plugins.gwatch([CONFIG.GULP.PATH.GWATCH_IMG], function () {
            plugins.runSequence([CONFIG.GULP.DEV_COPY_STATIC_FILES]);
        }, cb);

        // TODO copy also on all changed assets and libs dev:copyStaticFiles
        plugins.gwatch(CONFIG.SRC.ALL_HTML_TEMPLATES(), function () {
            plugins.runSequence([CONFIG.GULP.DEV_TEMPLATES]);
        }, cb);

        console.log("watch on: " + CONFIG.SRC.TS.TS_FILES());
        plugins.gwatch(CONFIG.SRC.TS.TS_FILES(), function () {
            plugins.runSequence([CONFIG.GULP.TSCOMPILE, CONFIG.GULP.TSLINT]);
        }, cb);

        plugins.gwatch(CONFIG.SRC.SASS_FILES(), function () {
            plugins.runSequence([CONFIG.GULP.DEV_STYLES]);
        }, cb);

    });

    function copyThirdPartyJS(env) {

        plugins.concat = plugins.concat || require(CONFIG.GULP.GULP_CONCAT);
        plugins.gulpIf = plugins.gulpIf || require(CONFIG.GULP.GULPIF);

        // , "bower_components/mobile-boilerplate/js/helper.js",
        gulp.src(CONFIG.SRC.JS.LIBS())
            .pipe(partials.errorPipe())
            .pipe(plugins.gulpIf(env === CONFIG.GULP.PROD, plugins.uglify()))
            .pipe(plugins.concat(CONFIG.GULP.PLUGINS_LIBS))
            .pipe(gulp.dest(CONFIG.DEV_FOLDER.DEV_OR_DIST_ROOT(env)));
        /*
         gulp.src(CONFIG.SRC.JS.SINGLE_LIBS())
         .pipe(partials.errorPipe())
         .pipe(plugins.gulpIf(env === CONFIG.GULP.PROD, plugins.uglify()))
         .pipe(gulp.dest(CONFIG.DEV_FOLDER.DEV_OR_DIST_ROOT(env)));
         */
    }

    // TODO generalize
    var getEnvironmentPath = function (env) {
        var ENV_PATH_ROOT = (env === CONFIG.GULP.DEV) ? CONFIG.DIST.DEV_FOLDER() : CONFIG.DIST.DIST_FOLDER();
        return ENV_PATH_ROOT + CONFIG.DIST.ROOT_PREFIX_PATH();
    };

    var copyResources = function (ENV_PATH_ROOT) {
        gulp.src(CONFIG.GULP.PATH.MOCKS)
            .pipe(partials.errorPipe())
            .pipe(gulp.dest(ENV_PATH_ROOT + CONFIG.GULP.PATH.MOCKS_DEST));

        gulp.src(CONFIG.GULP.PATH.IMG)
            .pipe(partials.errorPipe())
            .pipe(gulp.dest(ENV_PATH_ROOT + CONFIG.GULP.PATH.IMG_DEST));
    };

    // TODO not used, yet
    // for dev: use the intellij watcher.xml to import
    // See explanations: https://github.com/palantir/tslint
    //            ,"check-lowercase"
    gulp.task(CONFIG.GULP.TSLINT, function () {
        plugins.tslint = plugins.tslint || require(CONFIG.GULP.GULP_TSLINT);
        // TODO cache and move
        var tslintConfig = require(CONFIG.DEV.TSLINT_CONFIG());

        gulp.src(CONFIG.SRC.TS.TS_FILES())
            .pipe(partials.errorPipe())
            .pipe(plugins.tslint({configuration: tslintConfig}))
            .pipe(plugins.tslint.report(CONFIG.GULP.VERBOSE));
        /*
         .pipe(plugins.tslint({
         formatter: CONFIG.GULP.VERBOSE
         }))
         .pipe(plugins.tslint.report());
         ;
         */
    });

    var performTemplating = function (targetFolder, cb, env) {
        // Angular templating
        //TODO move to build_config
        var camelCaseModuleName = CONFIG.DYNAMIC_META.MODULE_NAME().replace(/-([a-z])/g, function (g) {
            return g[1].toUpperCase();
        });

        //TODO move all angular related stuff to tasks/angular
        // Angular templates, read at runtime
        function angularTemplating(targetFolder) {
            plugins.concat = plugins.concat || require(CONFIG.GULP.GULP_CONCAT);
            plugins.gulpIf = require(CONFIG.GULP.GULPIF);

            // https://github.com/kangax/html-minifier
            var hmtlMinConfig = {
                collapseBooleanAttributes: false,
                collapseBooleanAttributes: false,
                collapseWhitespace: true,
                preserveLineBreaks: true,
                removeAttributeQuotes: false,
                removeEmptyAttributes: false,
                removeRedundantAttributes: false,
                removeScriptTypeAttributes: false,
                removeStyleLinkTypeAttributes: false,
                removeAttributeQuotes: false,
// TODO e.g. enable this one
                removeComments: true,
                removeEmptyAttributes: false,
                removeRedundantAttributes: false,
                removeScriptTypeAttributes: false,
                removeStyleLinkTypeAttributes: false
            };

            gulp.src(CONFIG.SRC.ANGULAR_HTMLS())
                .pipe(plugins.gulpIf(env === CONFIG.GULP.PROD, plugins.htmlMin(hmtlMinConfig)))
                .pipe(plugins.ngHtml2js({
                    moduleName: camelCaseModuleName + CONFIG.GULP.TEMPLATECACHE,
                    prefix: "",
                    rename: function (templateUrl) {
                        return "/" + CONFIG.DIST.ROOT_PREFIX_PATH() + templateUrl;
                    }
                }))
                .pipe(plugins.concat(CONFIG.DIST.JS.FILES.TEMPLATES()))
                //.pipe(gulp.dest(CONFIG.DIST.DEV_FOLDER()))
                .pipe(plugins.gulpIf(env === CONFIG.GULP.PROD, plugins.uglify()))
                .pipe(gulp.dest(targetFolder + CONFIG.DIST.ROOT_PREFIX_PATH()));

        }

        angularTemplating(targetFolder);
        require("./tasks/buildtemplating/indexTemplating").performTemplatingAtBuildTime(targetFolder);
        cb();
    };

    // TODO refactor to split "lodash build templating" and angular templating
    gulp.task(CONFIG.GULP.DEV_TEMPLATES, function (cb) {
        plugins.htmlMin = plugins.noop;
        plugins.uglify = plugins.noop;

        var targetFolder = CONFIG.DIST.DEV_FOLDER();
        performTemplating(targetFolder, cb, CONFIG.GULP.DEV);
    });
    gulp.task(CONFIG.GULP.PROD_TEMPLATES, function (cb) {
        plugins.htmlMin = plugins.htmlMin || require("gulp-htmlmin");
        plugins.uglify = plugins.uglify || require(CONFIG.GULP.GULP_UGLIFY);

        var targetFolder = CONFIG.DIST.DIST_FOLDER();
        performTemplating(targetFolder, cb, CONFIG.GULP.PROD);
    });


    gulp.task(CONFIG.GULP.TASK.ECHO, function () {
        console.log(CONFIG.GULP.PARENT);
    });

    gulp.task(CONFIG.GULP.DEV_WEBSERVER, function () {
        plugins.browserSync = plugins.browserSync || require(CONFIG.GULP.BROWSER_SYNC);
        plugins.browserSync = require('browser-sync').create();

        plugins.proxy =  plugins.proxy || require('http-proxy-middleware');

        var keepOriginalHostHackFn = function(req) {
                var originalHost = "http://"+req.headers.host;
                return originalHost;
        };

        var pathRewriteFn = function (path, req) {
            var rewritePath = path.replace(/\..[0-9]+/, '');
            console.log(rewritePath);
            return rewritePath;
        };

        plugins.browserSync.init({
            server: {
                baseDir: CONFIG.DEV.WEBSERVER_BASE_ROOT_DIRS()
            },
            startPath: CONFIG.DEV.WEBSERVER_STARTPATH(),
            port: 9000,
            https: false,
            middleware: [
                plugins.proxy("**/*.*.js", {
                    target : "unused",
                    pathRewrite: pathRewriteFn,
                    router: keepOriginalHostHackFn
                   //, logLevel: 'debug'
                }),
                plugins.proxy("**/*.*.css", {
                    target : "unused",
                    pathRewrite: pathRewriteFn,
                    router: keepOriginalHostHackFn
                    //,logLevel: 'debug'
                })
            ]
            /*
            rewriteRules: [
                {
                    match: /(.*)(app|templates)(\.)([0-9]+)(\.js)/,
                    fn: function (req, web3, module, filename, dot, version, filextension) {
                        var redirectUrl = module + filename + dot + filextension;
                        console.log(redirectUrl);
                        return redirectUrl;
                    }
                }
            ]
            */

        });
    });

    // TODO only use one tscompile for dev, tests and prod for compact view
    // TODO refactor to dev:tscompile
    function handleJavaScript(tsfiles) {
        console.log(tsfiles);

        return gulp.src(tsfiles.concat(CONFIG.DEV_FOLDER.THIRDPARTY_TS_REFERENCE_FILE()))
            .pipe(partials.errorPipe())
            .pipe(plugins.typescript(
                {
                    //allowBool: true,
                    out: CONFIG.DIST.JS.FILES.APP(),
                    typescript: require("typescript"),
                    sortOutput: true,
                    diagnostics: true,
                    pretty: true
                    //sourcemap: doUseSourceMaps,
                    //sourceRoot: doUseSourceMaps ? "/" : null,
                    //target: ecmaScriptVersion
                })
            )
            ;
    }

    gulp.task(CONFIG.GULP.DEV_STYLES, function () {
        gulp_utils.sass = require(CONFIG.GULP.PATH.SASS);
        var envPath = getEnvironmentPath(CONFIG.GULP.DEV);
        gulp_utils.sass.performCSS(CONFIG.GULP.DEV)
            .pipe(gulp.dest(envPath));
    });
    gulp.task(CONFIG.GULP.PROD_STYLES, function () {
        gulp_utils.sass = require(CONFIG.GULP.PATH.SASS);

        var envPath = getEnvironmentPath(CONFIG.GULP.PROD);
        gulp_utils.sass.performCSS(CONFIG.GULP.PROD).pipe(gulp.dest(envPath));
    });

    gulp.task(CONFIG.GULP.TSCOMPILE, function () {
        plugins.uglify = plugins.noop;
        plugins.ngAnnotate = plugins.noop;

        var tsSourceFiles = CONFIG.SRC.TS.TS_FILES().concat(CONFIG.SRC.TS.TS_DEFINITIONS());
        var targetRootFolder = CONFIG.DIST.DEV_FOLDER();
        handleJavaScript(tsSourceFiles)
            .pipe(gulp.dest(targetRootFolder + CONFIG.DIST.ROOT_PREFIX_PATH()));
    });

    // TODO use handleJavaScript ()
    /*
     gulp.task(CONFIG.GULP.TS_COMPILE_TESTS, function () {
     console.log(CONFIG.SRC.TS.TS_UNIT_TEST_FILES());
     var sourceFiles = CONFIG.SRC.TS.TS_UNIT_TEST_FILES().concat(CONFIG.SRC.TS.TS_DEFINITIONS());
     return gulp.src(sourceFiles)
     .pipe(partials.errorPipe())
     .pipe(plugins.typescript(
     {
     allowBool: true,
     out: CONFIG.GULP.TEST_JS,
     // tmpDir : "./ts_tmp",
     // sourcemap: true,
     // sourceRoot: "/",
     target: CONFIG.GULP.ES3
     }))
     .pipe(gulp.dest(CONFIG.DEV.UNIT_TESTS_JS_FOLDER()));
     });
     */

    gulp.task(CONFIG.GULP.PROD_TSCOMPILE, function () {
        plugins.uglify = require(CONFIG.GULP.GULP_UGLIFY);
        plugins.ngAnnotate = plugins.ngAnnotate || require(CONFIG.GULP.GULP_NG_ANNOTATE);

        var tsfiles = CONFIG.SRC.TS.TS_FILES();
        var targetRootFolder = CONFIG.DIST.DIST_FOLDER();

        handleJavaScript(tsfiles)
            .pipe(plugins.ngAnnotate({
                remove: false,
                add: true,
                single_quotes: false
            }))
            .pipe(plugins.uglify(
                {
// TODO
                    mangle: false
                }
            ))
            .pipe(gulp.dest(targetRootFolder + CONFIG.DIST.ROOT_PREFIX_PATH()));
    });

    // TODO refactor CI only tasks to separate file
    // Run unit test once and exit
    gulp.task(CONFIG.GULP.TASK.TEST, function (done) {
        // TODO strategy to run tests separated
        // v. >0.13 requires node-gyp which has problems on installation
        npms.karma = npms.karma || require(CONFIG.GULP.KARMA).server;// on version 13 use Server; // TODO move server call to later
        new npms.karma.start({
            // "/node_modules/web3-common-build-setup/"+
            configFile: CONFIG.DEV.KARMA_CONFIG(),
            // Override specific config from file
            autoWatch: false,
            singleRun: true
            //browsers: ["PhantomJS"]
        }, function (exitCode) {
            console.log('Karma has exited with ' + exitCode);
            done();
            process.exit(exitCode);
        });
    });

    /**
     * Continuous Integration tasks
     */
    gulp.task("ci:documentation", function () {
        require("./tasks/maintain/documentation").generateDocumentation();
    });

    gulp.task("ci:dependencies", function () {
        require("./tasks/maintain/dependencies").createAngularDependencyGraph(gulp);
    });


    gulp.task("ci:performance", function () {
        require("./tasks/maintain/performance").performPerformanceAnalysis();
    });


    return gulp;
};

module.exports.initGulp = initGulp;
module.exports.depsFolder = __dirname + '/node_modules/';
module.exports.buildConfig = require(pathToBuildConfig);


var gulpUtils = require("./tasks/common/gulp_catch_error");
module.exports.partials = {"gulp_utils": gulpUtils};
