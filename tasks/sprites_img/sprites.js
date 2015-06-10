var plugins = {};
var gulp = require("gulp");
var exportObject = {};
var CONFIG = require("./../../config/build_config");

exportObject.generateSprites = function(){
    plugins.svgSprite = plugins.svgSprite || require("gulp-svg-sprite");

    var spritesConfig = {
        mode                : {
            css             : {     // Activate the «css» mode
                render      : {
                    css     : true  // Activate CSS output (with default options)
                }
            }
        }
    };

    var svgSrcFiles = CONFIG.SRC.SPRITES_IMG_BASE_FOLDER() + CONFIG.FILE_TYPE_MACHER.SVG();

    return gulp.src(svgSrcFiles)
        .pipe(plugins.svgSprite(spritesConfig));
};

module.exports = exportObject;