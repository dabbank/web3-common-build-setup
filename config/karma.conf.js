var CONFIG = {};
var folderToSRC = {};
var _ = require("lodash");
module.exports = function(karmaConfig) {

    CONFIG = require('./build_config.js');
    folderToSRC = _.clone(CONFIG.DEV.ABSOLUTE_FOLDER());
    var commonSetupModule = "web3-common-build-setup";
    var isStandaloneExecutedByIntelliJ = CONFIG.DEV.ABSOLUTE_FOLDER().indexOf(commonSetupModule) > -1;
console.log("ABSOLUTE"+CONFIG.DEV.ABSOLUTE_FOLDER());
    if(isStandaloneExecutedByIntelliJ){
        var toAppFolderPath = folderToSRC.indexOf("\\node_modules");
        folderToSRC = folderToSRC.substring(0, toAppFolderPath);
    }
    folderToSRC = folderToSRC+'/';
    console.log(folderToSRC);

    var tsFilesPreprocessorMatcher = folderToSRC+ '/src/**/*Test.ts';

    karmaConfig.set({
        preprocessors : {
//            tsFilesPreprocessorMatcher: ['typescript']
            //    '**/*.js': ['sourcemap']
        },
        // base path, that will be used to resolve files and exclude
        basePath: folderToSRC,

        frameworks: ['jasmine'],

        // TODO use CONFIG
        files: [
            {pattern: "tmp/tests/tests.js", watched: false, included: false, served: true},
            'dev_target/web3/danube-common-portal/libs.js',
              'dev_target/web3/danube-common-portal/templates.js',
  'dev_target/web3/danube-common-portal/app.js'


            //folderToSRC+ '/'+'gulp-tsc-tmp-114915-7264-52gdcc/app.js.map'
        ],

        exclude: [
        ],

        // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
	    /**
	     * To run Karma in IntelliJ with coverage, enable coverage reporter
	     */
        //reporters: ['dots', 'spec','junit', 'coverage'],


//        coverageReporter: {
//            type : 'html',     // cobertura (xml format supported by Jenkins)
//            dir : 'doc/coverage/'
//        },

        // the default configuration
        junitReporter: {
            outputFile: 'doc/test-results.xml',
            suite: ''
        },

        // web server port
        port: 9103,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: karmaConfig.LOG_DEBUG,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: false,


        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera (has to be installed with `npm install karma-opera-launcher`)
        // - Safari (only Mac; has to be installed with `npm install karma-safari-launcher`)
        // - PhantomJS
        // - IE (only Windows; has to be installed with `npm install karma-ie-launcher`)
        browsers: ['Chrome'],

        // If browser does not capture in given timeout [ms], kill it
        captureTimeout: 60000,
        browserNoActivityTimeout : 60000,
        // Continuous Integration mode
        // if true, it capture browsers, run tests and exit
        singleRun: false,

// Optional as parameter, default is all:
        // Must be defined when used with external tools such as gulp
      plugins : [
          //"karma-typescript-preprocessor",
          //"karma-sourcemap-loader",
          "karma-jasmine",
          "karma-chrome-launcher",
          "karma-phantomjs-launcher"
      ],

        // TODO not executed atm
        typescriptPreprocessor: {
            // options passed to the typescript compiler
            options: {
                sourceMap: true, // (optional) Generates corresponding .map file.
                target: 'ES5', // (optional) Specify ECMAScript target version: 'ES3' (default), or 'ES5'
                //module: 'amd', // (optional) Specify module code generation: 'commonjs' or 'amd'
                noImplicitAny: true, // (optional) Warn on expressions and declarations with an implied 'any' type.
                noResolve: true, // (optional) Skip resolution and preprocessing.
                removeComments: false // (optional) Do not emit comments to output.
            },
            // transforming the filenames
            transformPath: function(path) {
                return path.replace(/\.ts$/, '.js');
            }
        }

    });
};
