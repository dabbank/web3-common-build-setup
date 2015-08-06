// TODO


// If not started in chromeOnly-mode, need to start selenium first
// TODO switch for non chromeOnly mode
gulp.task("protractor", function () {
    npms.protractor = npms.protractor || require("gulp-protractor").protractor;

    // TODO must be in sync with specs of protractor
    //var srcNeeededForIntegrTest = "src/**/*.js";
    gulp.src([
//            CONFIG.DEV.UI_TEST_FILES()
        // CONFIG.DEV.ABSOLUTE_FOLDER()+"features/**/*.feature"
    ])
        .pipe(npms.protractor({
            //options : {
            configFile: CONFIG.DEV.PROTRACTOR_CONFIG()
            //args: {
            //    "specs" : ["whoo.js"]
            //}
            //}
        }))
        .on("error", function (e) {
            console.log(JSON.stringify(e));
            throw e;
        });
});

// TODO used for CI and other browsers, atm chromeOnly mode is used to be fast
gulp.task("seleniumServer", function () {
    var webdriverPath = __dirname + "node_modules\\chromedriver\\lib\\chromedriver\\chromedriver.exe";
    var command = "java -jar " + __dirname + "\\node_modules\\selenium-server-standalone-jar\\jar\\selenium-server-standalone-2.40.0.jar -Dwebdriver.chrome.driver=" + webdriverPath;
    exec(command, function (status, output) {
        console.log("Exit status:", status);
        console.log("Program output:", output);
    });
});