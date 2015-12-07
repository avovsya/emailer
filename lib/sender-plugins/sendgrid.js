var sendgrid = require('sendgrid');
var _        = require('lodash');
var config   = require('config');

var sendgridClient;

function init() {
  sendgridClient = sendgrid(config.get('sendgridApiKey'));
}

function send(letter, callback) {
  var message = new sendgridClient.Email(letter);
  sendgridClient.send(message, callback);
}

module.exports = {
  init: init,
  send: send
};
