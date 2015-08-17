var plugins = {};
var gulp = require("gulp");
var exportObject = {};

exportObject.generateSprites = function(svgSrcFiles){
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

    return gulp.src(svgSrcFiles)
        .pipe(plugins.svgSprite(spritesConfig));
};

module.exports = exportObject;