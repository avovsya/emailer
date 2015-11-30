var senders = require('./senders');
var Joi = require('joi');

var letterSchema = Joi.object().keys({
  to:       Joi.array().items(Joi.string().email()).required(),
  toname:   Joi.array().items(Joi.string()),
  from:     Joi.string().email().required(),
  fromname: Joi.string(),
  subject:  Joi.string(),
  text:     Joi.string(),
  html:     Joi.string(),
  bcc:      Joi.array().items(Joi.string().email()).required(),
  cc:       Joi.array().items(Joi.string().email()).required(),
  replyto:  Joi.string(), // TODO: this should be a part of the headers
  //TODO: files
  // files: [
  //   {
  //     filename:     '',           // required only if file.content is used.
  //     contentType:  '',           // optional
  //     cid:          '',           // optional, used to specify cid for inline content
  //     path:         '',           //
  //     url:          '',           // == One of these three options is required
  //     content:      ('' | Buffer) //
  //   }
  // ],
  // file_data:  {},
  headers:    Joi.object()
});

function validate (letter, cb) {
  return Joi.validate(letter, letterSchema, { abortEarly: false },  cb);
}

module.exports = {
  validate: validate
};
