/**
 * Created by 06966 on 10/20/2015.
 */

var _ = require("lodash");

var UTIL = {

    SRC: _.constant("./src/"),
    GLOBAL_TS_UNIT_TEST_FILES: _.constant("ts_tpl/**/*.test.ts"),
    BOWER_FOLDER : "bower_components/",
    MODULE_DEPENDENCY: require('./../tasks/common/module_dependency_utils'),

    BOWER_LIB_FILES_TO_CONCAT:[],
    BOWER_LIB_FILES_TO_CONCAT_DEV:function(){
            return UTIL.TO_FULL_PATH(UTIL.BOWER_LIB_FILES_TO_CONCAT, UTIL.BOWER_FOLDER);
    },

    BOWER_SINGLE_LIB_FILES_NO_CONCAT:[],
    BOWER_SINGLE_LIB_FILES_NO_CONCAT_DEV:function(){
        return UTIL.TO_FULL_PATH(UTIL.BOWER_SINGLE_LIB_FILES_NO_CONCAT, UTIL.BOWER_FOLDER);
    },

    MATCHER_FOR_ALL_TS: "*.ts",
    DYNAMIC_COMPONENT_DEPENDENCIES:function(){
        return UTIL.MODULE_DEPENDENCY.dabComponentsDependencies();
    },

    ALL_TS_FILES:function(){
        return  _.constant([].concat("./src/ts_tpl/**/*.module.ts").concat(UTIL.ADD_DINAMIC_TS_DEPENDENCIES(UTIL.DYNAMIC_COMPONENT_DEPENDENCIES(), UTIL.MATCHER_FOR_ALL_TS).concat(UTIL.TS_FILES())));
    },

    TS_FILES: function () {
        return [
            UTIL.SRC() + "ts_tpl/**/*.ts",
            "!" + UTIL.SRC() + UTIL.GLOBAL_TS_UNIT_TEST_FILES()
        ];
    },

    TS_UNIT_TEST_FILES: function () {
        return [
            UTIL.SRC() + "ts_tpl/**/*Test.d.ts",
            UTIL.SRC() + UTIL.GLOBAL_TS_UNIT_TEST_FILES()
        ];
    },

    MATCHER_FOR_ONLY_DTS:"*.d.ts",
    THIRDPARTY_TS_REFERENCE_FILE: _.constant("./reference.d.ts"),

    TS_DEFINITIONS: function () {
        return [
            UTIL.SRC() + "**/*.d.ts",
            UTIL.THIRDPARTY_TS_REFERENCE_FILE()
        ];
    },

    ALL_TS_UNIT_TEST_FILES:function(){
        return  _.constant(UTIL.ADD_DINAMIC_TS_DEPENDENCIES(UTIL.DYNAMIC_COMPONENT_DEPENDENCIES(), UTIL.MATCHER_FOR_ONLY_DTS).concat(UTIL.TS_UNIT_TEST_FILES()));
    },

    ANGULAR_HTMLS: function () {
        return UTIL.SRC() + "/ts_tpl/**/*.tpl.html";
    },

    DAB_COMPONENTS_DEPENDENCIES_TEMPLATECACHE_FILES:function(){
        return _.map(UTIL.MODULE_DEPENDENCY.dabComponentsDependencies(), function (prop) {
            return UTIL.BOWER_FOLDER + prop + '/' + UTIL.ANGULAR_HTMLS();
        })},
    ALL_ANGULAR_HTMLS:function(){
       return _.constant(UTIL.DAB_COMPONENTS_DEPENDENCIES_TEMPLATECACHE_FILES().concat(UTIL.ANGULAR_HTMLS()));
    },

    HTML_TEMPLATES: function () {
        return UTIL.SRC() + "**/*.html";
    },

    ALL_HTML_TEMPLATES: function () {
        return _.constant(UTIL.DAB_COMPONENTS_DEPENDENCIES_TEMPLATECACHE_FILES().concat(UTIL.HTML_TEMPLATES()));
    },

    ADD_DINAMIC_TS_DEPENDENCIES: function (dependencyPaths, tsFilePostfixMatcher) {
        var dabComponentsDependenciesTSFiles = _.map(dependencyPaths, function (prop) {
            // TODO distinguish between devDependency and dependency
            // performance optimization would be to always use .d.ts and take target of
            // dependency component for dependency ( always not for devDependency)

            return UTIL.BOWER_FOLDER + prop + '/' + "src/**/" + tsFilePostfixMatcher;
        });
        return dabComponentsDependenciesTSFiles;
    },

    TO_FULL_PATH:function (collectionToPrefix, prefix) {
        return collectionToPrefix.map(function (bowerFile) {
            return prefix + bowerFile;
        });
    },

    SHOW_HELP_MESSAGE_TO_CONSOLE:function () {
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
    },

    LOOK_DEEP:function (obj) {
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

}

_.mixin({

    crush: function (l, s, r) {
        return _.isObject(l) ? (r = function (l) {
            return _.isObject(l) ? _.flatten(
                _.map(l, s ? _.identity : r)
            ) : l;
        })(l) : [];
    }
});

module.exports = UTIL;
