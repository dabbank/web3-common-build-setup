// TODO not needed for the moment

var plugins = {};
var npms = {};
var exportObject = {};
var pathToBuildConfig = "../../config/build_config.js";
var CONFIG = CONFIG || require(pathToBuildConfig);


exportObject.performTemplatingAtBuildTime = function (targetFolder) {
    plugins.template = require("gulp-template");
    npms.fs = npms.fs || require("fs");

    var frameContentFileContent = "";
    try {
        frameContentFileContent = npms.fs.readFileSync(CONFIG.PARTIALS.MAIN());
    } catch (err) {
        console.log("Info: " + CONFIG.PARTIALS.MAIN() + " not found to use templating at buildtime" + err);
    }

    var templateVariables = {
        CONFIG: {
            DIST: {
                JS: {
                    HEAD_FILES: CONFIG.DIST.JS.HEAD_FILES()
                },
                CSS: {
                    HEAD_FILES: CONFIG.DIST.CSS.HEAD_FILES()
                }
            }
        },
        frameContent: frameContentFileContent
    };

    gulp.src(CONFIG.DEV.HTML_MAIN())
        .pipe(partials.errorPipe())
        .pipe(
        plugins.template(templateVariables, {
            interpolate: /<%gulp=([\s\S]+?)%>/g,
            evaluate: /<%gulp([\s\S]+?)%>/g
        })
    )
        .pipe(gulp.dest(targetFolder + CONFIG.DIST.ROOT_PREFIX_PATH()));
};

performTemplatingAtBuildTime(targetFolder);

module.exports = exportObject;