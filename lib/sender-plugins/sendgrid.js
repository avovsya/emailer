var sendgrid = require('sendgrid');
var _        = require('lodash');

var sendgridClient;

function init() {
  sendgridClient = sendgrid(process.env.SENDGRID_USER, process.env.SENDGRID_PASSWORD);
}

function send(letter, callback) {
  var message = new sendgridClient.Email(letter);
  sendgridClient.send(message, callback);
}

module.exports = {
  init: init,
  send: send
};
