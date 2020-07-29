
// credits https://github.com/panosoft/prince-promise
var dargs = require('dargs');
var Prince = require('prince')();
var _ = require('lodash');
var spawn = require('spawn-promise');
var config = require('./config');
const winston = require('./logger')(__filename);

var prince = config.PRINCE_BINARY || Prince.config.binary;
// Mandatory args, never want these overridden
var args = [
	'-' // read from stdin
];

var render = async function (input, options) {

	options = _.omitBy(options || {}, _.isNil);
	
	// Convert {optionName: value} -> ['--option-name=value']
	options = dargs(options);
	return await spawn(prince, args.concat(options), input);
};

module.exports = render;
