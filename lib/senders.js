var fs = require('fs');
var path = require('path');
var _ = require('lodash');

var senders = [];

function getSenders() {
  if (senders.length > 0) return senders;

  var pluginFolderPath = path.resolve(__dirname, './sender-plugins');

  var senderModules = fs.readdirSync(pluginFolderPath);

  senders = _(senderModules)
    .map(function (sender, i) {
      if (sender.indexOf('.js') === -1) {
        return null;
      }
      var modulePath = path.resolve(pluginFolderPath, sender);
      return {
        name: sender,
        send: require(modulePath).send
      };
    })
    .compact()
    .value();

  return senders;
}

module.exports = {
  get: getSenders
};
