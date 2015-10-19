var gulp = require("gulp");
var gulp_utils = require("../common/gulp_catch_error");
var partials = {};
partials.errorPipe = gulp_utils.errorPipe;
var plugins = plugins || {};

var generateDocumentation = function () {
    plugins.typedoc = require("gulp-typedoc");
    return gulp
        .src(["danube-core/portal/tsd/**/*.d.ts", "**/src/ts_tpl/**/*.ts", "!**/bower_components/**/src/ts_tpl/**/*.ts"])
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