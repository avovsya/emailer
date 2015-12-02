var mandrill = require('mandrill-api/mandrill');
var mandrillClient = new mandrill.Mandrill(process.env.MANDRILL_API_KEY);

function _transformToMandrillMessage(letter) {
  return {
  };
}

function send() {
}

module.exports = {
  send: send
};
