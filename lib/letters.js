var senders = require('./senders');
var db      = require('./db');
var Joi     = require('joi');
var async   = require('async');
var _       = require('lodash');

var letterSchema = Joi.object().keys({
  _id:      Joi.any(),
  to:       Joi.array().items(Joi.string().email()).required(),
  toname:   Joi.array().items(Joi.string()),
  from:     Joi.string().email().required(),
  fromname: Joi.string(),
  subject:  Joi.string(),
  text:     Joi.string(),
  html:     Joi.string(),
  replyto:  Joi.string().email()
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
});

function validate (letter, cb) {
  return Joi.validate(letter, letterSchema, { abortEarly: false },  cb);
}

function create (letter, cb) {
  async.series([
    validate.bind(null, letter),
    db.createLetter.bind(db, letter, cb)
  ], cb);
}

function send(letterId, cb) {
  async.waterfall([
    db.getLetter.bind(db, letterId),
    _getLetterAttachments,
    function (letter, waterfallCb) {
      if (!letter) {
        return waterfallCb(new Error('Not found'));
      }
      return waterfallCb(null, letter);
    },
    _sendLetter
  ], cb);
}

function addAttachment(letterId, attachment, attachmentName, cb) {
  async.waterfall([
    db.saveFile.bind(db, attachmentName, attachment),
    db.addLetterAttachmentId.bind(db, letterId)
  ], function (err, res) {
    if (err) return cb(err);
    if (res.result.nModified === 0) return cb(new Error('Not Found'));
    return cb();
  });
}

function _getLetterAttachments(letter, callback) {
  if (!letter || !letter.attachments) return callback(null, letter);
  async.map(letter.attachments, function(attachmentId, eachCb) {
    db.getFile(attachmentId, eachCb);
  }, function (err, result) {
    if (err) return callback(err);
    letter.attachments = result;
    return callback(null, letter);
  });
}

function _sendLetter(letter, cb) {
  var senderList = senders.get();

  var senderUsed;
  var index = 0;

  async.doUntil(
    function (untilCb) {
      if (index >= senderList.length) return untilCb(new Error("No senders left"));

      var sender = senderList[index];
      index += 1;

      sender.send(letter, function (err) {
        if (!err) {
          senderUsed = sender.name;
        }
        return untilCb();
      });
    },
    function () { return senderUsed; },
    function (err) {
      return cb(err, senderUsed);
    }
  );
}

module.exports = {
  validate: validate,
  send: send,
  create: create,
  addAttachment: addAttachment
};
