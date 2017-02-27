var mongoose = require('mongoose');
var SpiderSchema = require('../schemas/spider');
var Spider = mongoose.model('Spider', SpiderSchema);

module.exports = Spider;