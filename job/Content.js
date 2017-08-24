const cheerio = require('cheerio');
const superagent = require('superagent');
require('superagent-charset')(superagent);

const BiQiGeUtil = require('./utils/BiQiGeUtil.js')
const async = require('async');
