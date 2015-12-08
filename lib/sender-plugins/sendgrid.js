var sendgrid = require('sendgrid');
var _        = require('lodash');
var config   = require('config');

var sendgridClient;

function _tranformToSendgridMessage(letter) {
  var files = _.map(letter.attachments, function (attachment) {
    return {
      filename: attachment.name,
      content: attachment.content
    };
  });

  letter.files = files;
  delete letter.attachments;
  return letter;
}

function init() {
  sendgridClient = sendgrid(config.get('sendgridApiKey'));
}

function send(letter, callback) {
  var message = new sendgridClient.Email(_tranformToSendgridMessage(letter));
  sendgridClient.send(message, callback);
}

module.exports = {
  init: init,
  send: send
};
