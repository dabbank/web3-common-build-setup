// TODO not needed for the moment
var gulp = require("gulp");
var plugins = {};
var npms = {};
var partials = {
    errorPipe: require("../common/gulp_catch_error").errorPipe
};
var exportObject = {};
var pathToBuildConfig = "../../config/build_config.js";
var CONFIG = CONFIG || require(pathToBuildConfig);


exportObject.performTemplatingAtBuildTime = function (targetFolder) {
    plugins.template = require("gulp-template");
    npms.fs = npms.fs || require("fs");
    function performPlacingPartialIntoIndexHTML() {
        var frameContentFileContent = "";
        try {
            frameContentFileContent = npms.fs.readFileSync(CONFIG.PARTIALS.MAIN());
        } catch (err) {
            console.log("Info: " + CONFIG.PARTIALS.MAIN() + " not found to use templating at buildtime" + err);
        }
        return frameContentFileContent;
    }

    gulp.src(CONFIG.DEV.HTML_MAIN())
        .pipe(partials.errorPipe())
        .pipe(
        plugins.template(CONFIG.DEV.TEMPLATE_VARIABLES(), {
            interpolate: /<%gulp=([\s\S]+?)%>/g,
            evaluate: /<%gulp([\s\S]+?)%>/g
        })
    )
        .pipe(gulp.dest(targetFolder + CONFIG.DIST.ROOT_PREFIX_PATH()));
		
		
	gulp.src(CONFIG.DEV.HTML_MAIN_EFE())
        .pipe(partials.errorPipe())
        .pipe(
        plugins.template(CONFIG.DEV.TEMPLATE_VARIABLES(), {
            interpolate: /<%gulp=([\s\S]+?)%>/g,
            evaluate: /<%gulp([\s\S]+?)%>/g
        })
    )
        .pipe(gulp.dest(targetFolder + CONFIG.DIST.ROOT_PREFIX_PATH()));
};


module.exports = exportObject;