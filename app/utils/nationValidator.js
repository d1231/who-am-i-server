'use strict';

let __base = "../../";

let logger = (__base + "app/logger");

let config = require(__base + 'config');

let availableNations = config['AVAILABLE_NATIONS'];


module.exports = function (value) {

    let arr;

    if (Object.prototype.toString.call(value) !== '[object Array]') {
        arr =[];
        arr.push(value);
    } else {
        arr = value;
    }

    for (let i = 0; i < arr.length; i++) {
        if (!availableNations.has(arr[i])) {
            return false;
        }

    }

    return true;

};