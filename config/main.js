var env = process.env.NODE_ENV || 'dev',
    defaultConfig = require('./config.default'),
    envConfig = require('./config.' + env);

var extend = require('util')._extend;

module.exports = extend(defaultConfig, envConfig);