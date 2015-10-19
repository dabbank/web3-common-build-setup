// http://stackoverflow.com/questions/22741686/publishing-a-bower-package-with-bower
// http://www.frontendjunkie.com/2014/01/using-bower-as-package-management-tool.html

/**
 *  Let all Folders end with / , instead of beginning
 *
 */

var _ = require("lodash");
var path = require('path');
var module_dependency_utils = require('./../tasks/common/module_dependency_utils');


var bowerFolder = 'bower_components/';

var bowerLibFilesToConcat = [
];
var bowerLibFilesToConcat_DEV = toFullPath(bowerLibFilesToConcat, bowerFolder);
var bowerSingleLibFilesNoConcat = [
];
var bowerSingleLibFilesNoConcat_DEV = toFullPath(bowerSingleLibFilesNoConcat, bowerFolder);

var CONFIG = {
        DEV_FOLDER: {
            CSS: _.constant("./css/"),
            SASS: _.constant("./sass/"),
            SRC: _.constant("./src/"),
            RESOURCES: _.constant("./resources/"),
            MOCK: _.constant("./mock/"),
            TMP: _.constant("./tmp/"),
            THIRDPARTY_TS_REFERENCE_FILE: _.constant("./reference.d.ts"),// to be overridden
            DEV_OR_DIST_ROOT : function(env){
                var ENV_PATH_ROOT = (env === "dev") ? CONFIG.DIST.DEV_FOLDER() : CONFIG.DIST.DIST_FOLDER();
                ENV_PATH_ROOT = ENV_PATH_ROOT + CONFIG.DIST.ROOT_PREFIX_PATH();
                return ENV_PATH_ROOT;
            }
        },
        FILE_TYPE: {
        	SCSS: _.constant("**/*.scss")       	
        },
        FILE_TYPE_MACHER : {
            SVG : _.constant("**/*.svg")
        },
        DYNAMIC_META: {
            ROOT_IDENTIFIER: _.constant("web3/"),
            MODULE_NAME: _.constant(module_dependency_utils.getCurrentModuleName())
        },
        SRC: {
            INIT_APP_TEMPLATE: function () {
                return CONFIG.DEV_FOLDER.SRC() + "app/initapp.tpl";
            },
            
            SASS_FILES: function () {
                return CONFIG.DEV_FOLDER.SRC() + CONFIG.FILE_TYPE.SCSS();
            },
            JS: {
                LIBS: _.constant(bowerLibFilesToConcat_DEV),
                SINGLE_LIBS: _.constant(bowerSingleLibFilesNoConcat_DEV),
                MOCK_FILES: function () {
                    return CONFIG.DEV_FOLDER.MOCK() + "**/*.js";
                },
                FILES: function () {
                    return CONFIG.DEV_FOLDER.SRC() + "**/*.js";
                }
            },
            TS: {
                // Dynamically extended by devDependency components
                TS_FILES: function () {
                    return [
                        CONFIG.DEV_FOLDER.SRC() + "ts_tpl/**/*.ts",
                        "!" + CONFIG.SRC.TS.GLOBAL_TS_UNIT_TEST_FILES()
                    ];
                },
                // No dynamic dependencies needed
                TS_UNIT_TEST_FILES: function () {
                    return [
                        CONFIG.DEV_FOLDER.SRC() + "ts_tpl/**/*Test.d.ts",
                        CONFIG.DEV_FOLDER.SRC() + CONFIG.SRC.TS.GLOBAL_TS_UNIT_TEST_FILES()
                    ];
                },
                // TODO deprecated
                TS_DEFINITIONS: function () {
                    return [
                        CONFIG.DEV_FOLDER.SRC() + "**/*.d.ts",
                        CONFIG.DEV_FOLDER.THIRDPARTY_TS_REFERENCE_FILE()
                    ];
                },
                // TODO move to general files
                GLOBAL_TS_UNIT_TEST_FILES: _.constant("ts_tpl/**/*Test.ts") // must be global in TS_FILES
            },
            ANGULAR_HTMLS: function () {
                return CONFIG.DEV_FOLDER.SRC() + "/ts_tpl/**/*.tpl.html";
            },
            ALL_HTML_TEMPLATES: function () {
                return CONFIG.DEV_FOLDER.SRC() + "**/*.html";
            },
            THIRDPARTY: {
                FONTS: function () {
                    return CONFIG.SRC.THIRDPARTY.FONTS_FOLDER() + "fonts/**/*";
                },
                // TODO deprecated, refactor
                FONTS_FOLDER: _.constant(bowerFolder.concat("bootstrap-sass-official/assets/")),
                CSS: function () {
                    return ['']; // override in project's build config, if you need 3rd party css
                }
            },
            ASSETS: function () {
                return CONFIG.DEV_FOLDER.SRC() + "assets/**/*.js";
            },
            SPRITES_IMG_BASE_FOLDER: function () {
                return CONFIG.DEV_FOLDER.SRC() + CONFIG.DEV_FOLDER.SASS() + "sprites/svg/";
            },
            //TODO duplicated
            SASS_TARGET_FOLDER: function () {
                return CONFIG.DIST.DEV_FOLDER();
            }
        },
        DIST: {
            DEV_FOLDER: _.constant('./dev_target/'),
            DIST_FOLDER: _.constant("dist_target/"),
            ROOT_PREFIX_PATH: function () {
                return CONFIG.DYNAMIC_META.ROOT_IDENTIFIER() + CONFIG.DYNAMIC_META.MODULE_NAME() + "/";
            },
            //TODO duplicated in a way
            FILES: function () {
                return CONFIG.DIST.DEV_FOLDER() + "**/*";
            },
            JS: {
                //TODO duplicated
                DEV_FOLDER: function () {
                    return CONFIG.DIST.DEV_FOLDER();
                },
                FILES: {
                    LIBS: _.constant('libs.js'),
                    MOCKS: _.constant('mocks.js'),
                    APP: _.constant('app.js'),
                    TEMPLATES: _.constant('templates.js')
                },
                HEAD_FILES: function () {
                    return [
                        CONFIG.DIST.JS.FILES.LIBS(),
                        //CONFIG.DIST.JS.FILES.MOCKS(),
                        CONFIG.DIST.JS.FILES.TEMPLATES(),
                        CONFIG.DIST.JS.FILES.APP()
                    ];
                }
            },
            TS: {
                SRC_FOLDER: function () {
                    return CONFIG.DIST.DEV_FOLDER() + "src/";
                }
            },
            CSS: {
                DEV_FOLDER: function () {
                    return CONFIG.DEV_FOLDER.SASS() + "./target/css/";
                },
                CSS_MAIN: _.constant("main.css"),
                WATCH_FILES: function () {
                    return CONFIG.DIST.CSS.DEV_FOLDER() + '**/*.scss';
                },
                HEAD_FILES: function () {
                    return CONFIG.DEV_FOLDER.CSS() + CONFIG.DIST.CSS.CSS_MAIN();
                }
            }
        },
        CI: {
            DOCS_FOLDER: _.constant("./generated/docs")
        },
        PARTIALS: {
            MAIN: function () {
                return CONFIG.DEV_FOLDER.SRC() + "frameContent.html";
            }
        },
        DEV: {
            WEBSERVER_BASE_ROOT_DIRS: function () {
                return [
                    "./", 					// For Sourcemaps
                    CONFIG.DIST.DEV_FOLDER()
                ];
            },
            WEBSERVER_STARTPATH: function () {
                return CONFIG.DIST.ROOT_PREFIX_PATH() + "/index.html";
            }
            ,
            HTML_MAIN: function () {
                return CONFIG.DEV_FOLDER.SRC() + "index.html";
            }
            ,
            ABSOLUTE_FOLDER: _.constant(path.resolve()), // used for windows "\\"
            CURRENT_APP: _.constant(path.basename()),
            STANDALONE_FOLDER: function () {
                return CONFIG.DIST.DEV_FOLDER();
            }
            ,
            UNIT_TESTS_JS_FOLDER: function () {
                return CONFIG.DEV_FOLDER.TMP() + "tests/";
            }
            ,
// TODO refactor to folder
            UI_TEST_FILES: _.constant("./uiTests/**/*.js"),
            // TODO refactor
            PROTRACTOR_CONFIG: _.constant(__dirname + "/protractor.config.js"),
            KARMA_CONFIG: _.constant(__dirname + "/karma.conf.js"),
            TSLINT_CONFIG: _.constant(__dirname + "/tslint.json"),
            NG_MODULE_DEPS: function () {
                return [];
            }
        },
        GULP:{
            TYPESCRIPT: "gulp-typescript",
            HTML2JS:"gulp-ng-html2js",

            TASK:{
                DEFAULT:"default",
                CLEAN :"clean",
                WATCH:"watch",
                TEST:"test",
                ECHO:"echo"
            },

            DEL:"del",
            PROD_ONCE:"prod:once",
            PROD:"prod",
            PROD_FROM_COMMON:"prodFromCommon",
            PROD_TSCOMPILE:"prod:tscompile",
            PROD_COPY_STATIC_FILES:"prod:copyStaticFiles",
            PROD_TEMPLATES:"prod:templates",
            PROD_STYLES:"prod:styles",

            DEV:"dev",
            DEV_FROM_COMMON:"devFromCommon",
            DEV_ONCE:"dev:once",
            DEV_COPY_STATIC_FILES:"dev:copyStaticFiles",
            DEV_WEBSERVER:"webserver",
            DEV_TEMPLATES:"dev:templates",
            DEV_STYLES:"dev:styles",
            TS_COMPILE_TESTS:"tscompiletests",
            TSCOMPILE:"tscompile",
            TSLINT:"tslint",

            PATH:{
                SASS:"./tasks/styles/sass",
                GWATCH_MOCKS:"./src/mocks/**",
                GWATCH_IMG:"./src/img/**",
                MOCKS:"./src/mocks/**/*",
                IMG:"./src/img/**/*",
                MOCKS_DEST:"mocks/",
                IMG_DEST:"img/",
                RECURSIVE:"**/*.*",
                CATCH_ERROR_JS:"./tasks/common/gulp_catch_error"
            },

            TEMPLATECACHE:"Templatecache",

            GULP_CONCAT:"gulp-concat",
            GULP_UGLIFY:"gulp-uglify",
            GULPIF:"gulp-if",
            GULP_WATCH:"gulp-watch",
            GULP_TSLINT:"gulp-tslint",
            GULP_NG_ANNOTATE:"gulp-ng-annotate",

            PLUGINS_RUNSEQUENCE:"run-sequence",
            PLUGINS_LIBS:"libs.js",
            VERBOSE:"verbose",
            PARENT:"parent",
            BROWSER_SYNC:"browser-sync",
            KARMA:"karma",
            ES5:"ES5",
            TEST_JS:"tests.js",
            ES3:"ES3",

            SHOW_HELP_MESSAGE_TO_CONSOLE: function () {
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
            }

        },
        GET_ENVIRONMENT_PATH : function(env){
            var ENV_PATH_ROOT = (env === CONFIG.GULP.DEV) ? CONFIG.DIST.DEV_FOLDER() : CONFIG.DIST.DIST_FOLDER();
            return ENV_PATH_ROOT + CONFIG.DIST.ROOT_PREFIX_PATH();
        },

    }
    ;

// TODO extract all functions to another File

// Register new Mixing in _
// Returns all attributes of an object
_.mixin({

    crush: function (l, s, r) {
        return _.isObject(l) ? (r = function (l) {
            return _.isObject(l) ? _.flatten(
                _.map(l, s ? _.identity : r)
            ) : l;
        })(l) : [];
    }
});

var dynamicComponentDependencies = module_dependency_utils.dabComponentsDependencies();

var matcherForAllTS = "*.ts";
var dabComponentsDependenciesTSFiles = addDynamicTSDependencies(dynamicComponentDependencies, matcherForAllTS);
CONFIG.SRC.TS.TS_FILES = _.constant([].concat("./src/ts_tpl/**/*.module.ts").concat(dabComponentsDependenciesTSFiles.concat(CONFIG.SRC.TS.TS_FILES())));



var matcherForOnlyDTS = "*.d.ts";
var dabComponentsDependenciesTSFiles_TESTS = addDynamicTSDependencies(dynamicComponentDependencies, matcherForOnlyDTS);
CONFIG.SRC.TS.TS_UNIT_TEST_FILES = _.constant(dabComponentsDependenciesTSFiles_TESTS.concat(CONFIG.SRC.TS.TS_UNIT_TEST_FILES()));


var dabComponentsDependenciesTEMPLATECACHEFiles = _.map(module_dependency_utils.dabComponentsDependencies(), function (prop) {
    return bowerFolder + prop + '/' + CONFIG.SRC.ANGULAR_HTMLS();
});

CONFIG.SRC.ANGULAR_HTMLS = _.constant(dabComponentsDependenciesTEMPLATECACHEFiles.concat(CONFIG.SRC.ANGULAR_HTMLS()));
CONFIG.SRC.ALL_HTML_TEMPLATES = _.constant(dabComponentsDependenciesTEMPLATECACHEFiles.concat(CONFIG.SRC.ALL_HTML_TEMPLATES()));

// TODO move to the end
var configIsValid = _(CONFIG)
    .crush()
    .map(_.isFunction)
    .all();

//if (!configIsValid) {
//    throw new Error('CONFIG attributes need to be functions. Use _.constant("value") instead');
//}

// eighter .d.ts or .ts which includes .d.ts
function addDynamicTSDependencies(dependencyPaths, tsFilePostfixMatcher) {
    var dabComponentsDependenciesTSFiles = _.map(dependencyPaths, function (prop) {
        // TODO distinguish between devDependency and dependency
        // performance optimization would be to always use .d.ts and take target of
        // dependency component for dependency ( always not for devDependency)

        return bowerFolder + prop + '/' + "src/**/" + tsFilePostfixMatcher;
    });
    return dabComponentsDependenciesTSFiles;
}


function toFullPath(collectionToPrefix, prefix) {
    return collectionToPrefix.map(function (bowerFile) {
        return prefix + bowerFile;
    });
}

// TODO extract to another file
function lookdeep(obj) {
    var A = [], tem;
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            tem = obj[p];
            if (tem && typeof tem == 'object') {
                var value = arguments.callee(tem);
                A[A.length] = p + ':{ ' + value.join(', ') + '}';
            }
            else {
                // Execute function constant
                A[A.length] = [p + ':' + tem().toString()];
            }
        }
    }
    return A;
}

// TODO move to global gulpfile
//console.log(lookdeep(CONFIG));
//var result = JSON.stringify(lookdeep(CONFIG), null, 2);
//console.log(result.replace(/,/g, ",\n"));

module.exports = CONFIG;
