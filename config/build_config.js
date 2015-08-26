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
    'angular/angular.js',
    'angular-bootstrap/ui-bootstrap.js',
    'angular-bootstrap/ui-bootstrap-tpls.js',
    'angular-i18n/angular-locale_de-de.js'
];
var bowerLibFilesToConcat_DEV = toFullPath(bowerLibFilesToConcat, bowerFolder);

var bowerSingleLibFilesNoConcat = [
    'json3/lib/json3.js',
    'angular-ui-utils/ui-utils-ieshiv.js'
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
                GLOBAL_TS_UNIT_TEST_FILES: _.constant("**/*Test.ts") // must be global in TS_FILES
            },
            ANGULAR_HTMLS: function () {
                return CONFIG.DEV_FOLDER.SRC() + "**/*.tpl.html";
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
            FILES: function () {
                return CONFIG.DIST.DEV_FOLDER() + "**/*";
            },
            JS: {
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
                return CONFIG.DIST.ROOT_PREFIX_PATH() + "/index.html" + "#?mockMode=true";
            }
            ,
            HTML_MAIN: function () {
                return CONFIG.DEV_FOLDER.SRC() + "index.html";
            }
            ,
            ABSOLUTE_FOLDER: _.constant(path.resolve() + "\\"),
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
        }
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
