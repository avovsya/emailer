var mandrill = require('mandrill-api/mandrill');
var _        = require('lodash');
var config   = require('config');

var mandrillClient;

function _transformToMandrillMessage(letter) {
  var to = _.zipWith(letter.to, letter.toname, function (email, name) {
    return {
      email: email,
      name: name,
      type: 'to'
    };
  });

  var attachments = _.map(letter.attachments, function(attachment) {
    return {
      name: attachment.name,
      content: attachment.content.toString('base64')
    };
  });

  return {
    html: letter.html,
    text: letter.text,
    subject: letter.subject,
    from_email: letter.from,
    from_name: letter.fromname,
    to: to,
    headers: {
      "Reply-To": letter.replyto
    },
    attachments: attachments
  };
}

function init() {
  mandrillClient = new mandrill.Mandrill(config.get('mandrillApiKey'));
}

function send(letter, callback) {
  mandrillClient.messages.send({
    async: false,
    message: _transformToMandrillMessage(letter)
  }, function (result) {
    return callback(undefined, result);
  }, function (error) {
    return callback(error);
  });
}

module.exports = {
  init: init,
  send: send
};
