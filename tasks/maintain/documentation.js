var gulp = require("gulp");
var gulp_utils = require("../common/gulp_catch_error");
var partials = {};
partials.errorPipe = gulp_utils.errorPipe;
var plugins = plugins || {};

var generateDocumentation = function () {
    plugins.typedoc = require("gulp-typedoc");
    var ALL_TS_SRC_FILES = ["danube-core/portal/tsd/**/*.d.ts", "**/src/ts_tpl/**/*.ts", "!**/bower_components/**/src/ts_tpl/**/*.ts"];
    return gulp
        .src(ALL_TS_SRC_FILES)
        .pipe(partials.errorPipe())
        .pipe(plugins.typedoc({
            //module: "commonjs",
            target: "es5",
            out: "docs/",
            mode: "file",
            includeDeclarations: true,
            name: "Danube---web"
        }));
};

module.exports = {
    generateDocumentation: generateDocumentation
};