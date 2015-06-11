var fs = require('fs');
var _ = require('lodash');


var PREFIX_TO_MATCH_BUILD_SRC_DEPENDENCY = ".*";
// todo cache somehow bowerjson

var getBowerJson = function (absolutePath) {
    absolutePath = absolutePath || "";
    return getJsonMetaFor( absolutePath+ "bower.json");
};

var getJsonMetaFor = function (filePath) {
    if(!fs.existsSync(filePath)) {
        console.log("NO BOWER JSON FILE was found. This is unexpected!");
        return {name : "unspecified"};
    }

    var bowerFile = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(bowerFile);
};

var getCurrentModuleName = function(){
    var bowerJson = getBowerJson();
    return bowerJson.name;
};

// TODO make a function
var dabComponentsDependencies = function (absolutePath){
    var bowerJson = getBowerJson(absolutePath);
    var resolvedDependencies = _(bowerJson.devDependencies)
        .pairs()
        .filter(function (item) {
            return _.first(item).match("^"+PREFIX_TO_MATCH_BUILD_SRC_DEPENDENCY+"-.*-component$");
        })
        .map(_.first)
        .value();
    return resolvedDependencies;
};

module.exports = {
    getBowerJson: getBowerJson,
    getCurrentModuleName : getCurrentModuleName,
    dabComponentsDependencies: dabComponentsDependencies
};