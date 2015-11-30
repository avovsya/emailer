var fs = require('fs');
var path = require('path');
var _ = require('lodash');

function getSenders() {
  var result = {};

  var pluginFolderPath = path.resolve(__dirname, './sender-plugins');

  var senders = fs.readdirSync(pluginFolderPath);

  _.each(senders, function (sender) {
    var modulePath = path.resolve(pluginFolderPath, sender);
    result[sender] = require(modulePath);
  });

  return result;
}

module.exports = {
  get: getSenders
};
