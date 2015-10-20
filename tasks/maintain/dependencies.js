var partials = {};
partials.errorPipe = require("../common/gulp_catch_error").errorPipe;

var createAngularDependencyGraph = function (gulp) {
    var plugins = plugins || {};
    plugins.ngGraph = require('gulp-angular-architecture-graph');
    var ALL_JS_APP_FILES = ["**/*/dev_target/**/app.js', '!**/bower_components/**/*"];
    ALL_JS_APP_FILES = "danube-core/portal/dev_target/web3/danube-core-portal/app.js";
    // ALL_JS_APP_FILES = "**/dev_target/**/app.js";
    return gulp.src(ALL_JS_APP_FILES)
        .pipe(partials.errorPipe())
        .pipe(plugins.ngGraph({
            dest: 'ci_target/dependencyGraph'
        }));
};

module.exports = {
    createAngularDependencyGraph: createAngularDependencyGraph
};


