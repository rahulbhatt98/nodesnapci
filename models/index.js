"use strict"
var fs   = require('fs');
var path = require('path');
var _    = require('underscore');
module.exports = function(mongoose,wagner) {
    var models = {};
    var excludeFiles = ["index.js","entity","table"];
    fs
    .readdirSync(__dirname)
    .filter(file => {
    return (file.indexOf('.') !== 0) && (excludeFiles.indexOf(file) < 0);
    })
    .forEach(file => {
      var model = require(path.join(__dirname, file));
      var modelname = (file.replace('Model.js',''))
      wagner.factory(modelname,()=>{
        return model
      })
    });
    return models
};
