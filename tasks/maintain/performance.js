var phantomas = require('phantomas');

// npm install phantomas@1.12.0 -g

var performPerformanceAnalysis = function () {
    // TODO
    phantomas('http://localhost:9000/web3/danube-core-portal//index.html#!/welcome',
        {
            "analyze-css": true,
            "reporter": "csv"
        }, function (err, json, results) {
            console.log([
                'phantomas results',
                err, // null or exit code from phantomas process
                json, // parsed JSON with raw results
                results // results object with metrics values, offenders, asserts data
            ]);


            var fs = require('fs');
            fs.writeFile("reports.json", JSON.stringify(json), function (err) {
                if (err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
            });
        });
}
module.exports = {
    performPerformanceAnalysis: performPerformanceAnalysis
}