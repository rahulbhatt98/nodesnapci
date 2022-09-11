"use strict"
const mongoose  = require('mongoose');
const config    = require('config')
//mongoose.set('useFindAndModify', false);
module.exports  = async (wagner) => {
    mongoose.connect(`${config.mongoURI}`, {
        useNewUrlParser: true, useUnifiedTopology: true, dbName: config.dbName
    })
    .then(response=> { console.log("Database connection successful"); return response})
    .catch(error => console.log("error : ",JSON.stringify(error)));
}