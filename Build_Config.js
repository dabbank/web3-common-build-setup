// http://stackoverflow.com/questions/22741686/publishing-a-bower-package-with-bower
// http://www.frontendjunkie.com/2014/01/using-bower-as-package-management-tool.html

// TODO exclude . copy target file to this folder
var DAB_CQ = "../../../../dab-cq/xsl/dabbank/";
var DAB_WEBDEV = "C:\\seu\\svn\\dab-enterprise\\branches\\angulartemplate\\dab-portal\\dab-web\\";
var CUSTOM_TYPESCRIPT_COMPILER = "";//"C:\\dev\\svn\\web3\\dab-enterprise\\branches\\angulartemplate\\dab-portal\\dab-web\\node_modules\\typescript\\";

var _ = require('lodash');
var path = require('path');

var module_dependency_utils = require('./module_dependency_utils');

// TODO remove dab specific variables
var DAB_CQ_CSS = DAB_CQ + "css/";
var DAB_CQ_SCRIPTS_DISTRIB = DAB_CQ + "scripts_distributable/";
var DAB_CQ_WEB_FOLDER = "dab-web/";

//'C:\\dev\\daamenda\\AppData\\npm\\node_modules\\typescript';

var bowerFolder = 'bower_components/';
var bowerFolderPARENT = ''; // deprecated
var commonSetupModule = "web3-common-build-setup";//"web3-common-build-setup";
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

// TODO Deprecated
// CONFIG.DEV.STANDALONE_FOLDER(),
//            CONFIG.SRC.SASS_TARGET_FOLDER(),
//            CONFIG.SRC.THIRDPARTY.FONTS_FOLDER()

var CONFIG = {
    FOLDER: {
        JS: _.constant(""), // TODO deprecated
        CSS: _.constant("css/"),
        SASS : _.constant("sass/"),
        SRC : _.constant("src/"),
        TMP : _.constant("tmp/"),
        // default TODO refactor to environmentConfig
        GLOBAL_MODULE : _.constant("dab-bootstrap-component/"),
		DAB_WEBDEV : _.constant(DAB_WEBDEV)
    },
    DYNAMIC_META : {
        MODULE_NAME : module_dependency_utils.getCurrentModuleName
    },
    SRC: {
        SASS_FOLDER: function() {
            return CONFIG.FOLDER.SASS();
        },
        SASS_MAIN : function () {
            return CONFIG.SRC.SASS_FOLDER() + "main.scss";
        },
        JS: {
            LIBS: _.constant(bowerLibFilesToConcat_DEV),
            SINGLE_LIBS: _.constant(bowerSingleLibFilesNoConcat_DEV)
        },
        TS: {
            // TODO make src a variable
            FILES: _.constant("src/**/*.js"), // TODO move to JS
            // Dynamically extended by devDependency components
            TS_FILES: function(){
                return [//"bower_components/dab-bootstrap-component/src/**/*.ts",
                    // TODO **/src to have common rules for all dynamic added modules
                    "src/**/*.ts", "!" + CONFIG.SRC.TS.GLOBAL_TS_UNIT_TEST_FILES(),
                    "node_modules/" + commonSetupModule + "/ts_definitions/reference.d.ts"
                ];
            },
            // No dynamic dependencies needed
            TS_UNIT_TEST_FILES : function(){
                return [
                    "node_modules/" + commonSetupModule + "/ts_definitions/reference.d.ts",
                    "src/" + CONFIG.SRC.TS.GLOBAL_TS_UNIT_TEST_FILES(),
                    "src/**/*.d.ts"
                ];
            },
            // TODO move to general files
            GLOBAL_TS_UNIT_TEST_FILES :_.constant("**/*Test.ts") // must be global in TS_FILES
        },
        ANGULAR_HTMLS: _.constant("src/**/*.tpl.html"),
        ALL_HTML_TEMPLATES : function(){
            return [CONFIG.DEV.STANDALONE_FOLDER()+ "**/*.html", "src/**/*.html"];
        },
        THIRDPARTY: {
            FONTS : function(){
                return CONFIG.SRC.THIRDPARTY.FONTS_FOLDER() + "fonts/**/*";
            },
            FONTS_FOLDER : _.constant(bowerFolder.concat("bootstrap-sass-official/assets/")),
            CSS : _.constant(bowerFolderPARENT + bowerFolder)
        },
        ASSETS : _.constant('src/assets/**/*.js'),
        SPRITES_IMG_BASE_FOLDER : function(){
            return CONFIG.FOLDER.SASS() + "sprites/img";
        },
        SASS_TARGET_FOLDER : function(){
            return bowerFolderPARENT + bowerFolder + CONFIG.FOLDER.GLOBAL_MODULE() + CONFIG.FOLDER.SASS()+ CONFIG.DIST.FOLDER();
        }
    },
    DIST: {
        FOLDER : _.constant('target/'),
        FILES : function(){
            return CONFIG.DIST.FOLDER() + "**/*";
        },
        //ASSETS_FOLDER: _.constant('target/assets/'),
        JS: {
            FOLDER: function () {
                return CONFIG.DIST.FOLDER() + CONFIG.FOLDER.JS(); // TODO deprecated ?
            },
            FILES: {
                LIBS: _.constant('libs.js'),
                APP: _.constant('app.js'),
                TEMPLATES: _.constant('templates.js')
            },
            HEAD_FILES: function () {
                return [
                    CONFIG.FOLDER.JS() + CONFIG.DIST.JS.FILES.LIBS(),
                    CONFIG.FOLDER.JS() + CONFIG.DIST.JS.FILES.TEMPLATES(),
                    CONFIG.FOLDER.JS() + CONFIG.DIST.JS.FILES.APP()
                ];
            }
        },
        TS : {
            SRC_FOLDER : function(){
                return CONFIG.DIST.FOLDER() + "src/";
            }
        },
        CSS: {
            FOLDER: function () {
                return CONFIG.FOLDER.SASS()+CONFIG.DIST.FOLDER() + "css/";
            },
            CSS_MAIN: _.constant("main.css"),
            WATCH_FILES: function () {
                return CONFIG.DIST.CSS.FOLDER() + '**/*.scss';
            },
            HEAD_FILE: function () {
                return CONFIG.FOLDER.CSS() + CONFIG.DIST.CSS.CSS_MAIN();
            }
        }
    },
    CI : {
      DOCS_FOLDER : _.constant("./generated/docs")
    },
    PARTIALS: {
        MAIN: _.constant('./src/frameContent.html')
    },
    DEV: {
		WEBSERVER_BASE_ROOT_DIRS : function(){
			return [
				"./", 					// For Sourcemaps
				CONFIG.DIST.FOLDER()           
			];
		}
		,
        HTML_MAIN: function(){
            return CONFIG.DEV.STANDALONE_FOLDER() + "index.html";
        }
        ,
        ABSOLUTE_FOLDER: _.constant(path.resolve() + "\\"),
        CURRENT_APP: _.constant(path.basename()),
        STANDALONE_FOLDER: function(){
            return bowerFolder + CONFIG.FOLDER.GLOBAL_MODULE() +"portal_standalone/dev_standalone/";
        },
        UNIT_TESTS_JS_FOLDER :  function(){
            return CONFIG.FOLDER.TMP() + "tests/";
            }
        ,
        // TODO refactor to folder
        UI_TEST_FILES : _.constant("./uiTests/**/*.js"),
        // TODO refactor
        PROTRACTOR_CONFIG : _.constant("node_modules/web3-common-build-setup/protractor.config.js"),
        CUSTOM_TYPESCRIPT_COMPILER : _.constant(CUSTOM_TYPESCRIPT_COMPILER)
    },
    DAB_CQ: {
        DIST : {
            CURRENT_MODULE : function(){
                return DAB_CQ_SCRIPTS_DISTRIB + CONFIG.DAB_CQ.DIST.CURRENT_RELATIVE_MODULE();
            },
            CURRENT_RELATIVE_MODULE : function(){
                return DAB_CQ_WEB_FOLDER + CONFIG.DYNAMIC_META.MODULE_NAME() + "/";
            }
        },

        DEV: {
            CSS: {
                FOLDER: _.constant(DAB_CQ_CSS) // TODO rename and add
            }
        }
    }
};

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
CONFIG.SRC.TS.TS_FILES = _.constant(dabComponentsDependenciesTSFiles.concat(CONFIG.SRC.TS.TS_FILES()));

var matcherForOnlyDTS = "*.d.ts";
var dabComponentsDependenciesTSFiles_TESTS = addDynamicTSDependencies(dynamicComponentDependencies, matcherForOnlyDTS);
CONFIG.SRC.TS.TS_UNIT_TEST_FILES = _.constant(dabComponentsDependenciesTSFiles_TESTS.concat(CONFIG.SRC.TS.TS_UNIT_TEST_FILES()));


var dabComponentsDependenciesTEMPLATECACHEFiles = _.map(module_dependency_utils.dabComponentsDependencies(), function(prop){
    return bowerFolder + prop + '/' + CONFIG.SRC.ANGULAR_HTMLS();
});

CONFIG.SRC.ANGULAR_HTMLS = _.constant(dabComponentsDependenciesTEMPLATECACHEFiles.concat(CONFIG.SRC.ANGULAR_HTMLS()));
CONFIG.SRC.ALL_HTML_TEMPLATES = _.constant(dabComponentsDependenciesTEMPLATECACHEFiles.concat(CONFIG.SRC.ALL_HTML_TEMPLATES()));

// TODO move to the end
var configIsValid = _(CONFIG)
    .crush()
    .map(_.isFunction)
    .all();

if (!configIsValid) {
    throw new Error('CONFIG attributes need to be functions. Use _.constant("value") instead');
}

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
function lookdeep(obj){
    var A= [], tem;
    for(var p in obj){
        if(obj.hasOwnProperty(p)){
            tem= obj[p];
            if(tem && typeof tem == 'object'){
                var value = arguments.callee(tem);
                A[A.length]= p+':{ '+value.join(', ')+'}';
            }
            else{
                // Execute function constant
                A[A.length]= [p+':'+tem().toString()];
            }
        }
    }
    return A;
}

// TODO move to global gulpfile
//console.log(lookdeep(CONFIG));
var result = JSON.stringify(lookdeep(CONFIG), null, 2);
console.log(result.replace(/,/g, ",\n"));

module.exports = CONFIG;