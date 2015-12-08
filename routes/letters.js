var letters = require('../lib/letters');

function create(req, res, next) {
  letters.create(req.body, function (err, id) {
    if (err) {
      if (err.name && err.name === 'ValidationError') {
        res.status(400);
        return res.json({success: false, error: err}); 
      }

      return next(err);
    }
    return res.json({id: id});
  });
}

function send(req, res, next) {
  letters.send(req.params.id, function (err, senderName) {
    if (err) {
      if (err.message && err.message === 'No senders left') {
        res.status(503);
        return res.json({success: false, error: err.message});
      } else if (err.message && err.message === 'Not found') {
        res.status(404);
        return res.json({success: false, error: err.message});
      }
      return next(err);
    }
    return res.json({success: true, sender: senderName});
  });
}

function addAttachment(req, res, next) {
  if (!req.file) {
    res.status(400);
    return res.json({success: false, error: 'File not attached'});
  }
  letters.addAttachment(req.params.id, req.file.buffer, function (err) {
    if (err) {
      if (err.message && err.message === 'Not Found') {
        res.status(404);
        return res.json({success: false, error: err.message});
      }
      return next(err);
    }
    return res.json({success: true});
  });
}

module.exports = {
  create: create,
  send: send,
  addAttachment: addAttachment
};
