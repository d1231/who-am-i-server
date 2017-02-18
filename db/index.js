var mongoose = require('mongoose');

function init(mongoUrl) {

    mongoose.Promise = global.Promise;

    return new Promise(function (resolve, reject) {

        mongoose.connect(mongoUrl, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });

    });
}

function disconnect() {

    mongoose.connection.close();
}

module.exports.init = init;
module.exports.disconnect = disconnect;