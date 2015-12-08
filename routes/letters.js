var letters = require('../lib/letters');

function create(req, res) {
  letters.create(req.body, function (err, id) {
    if (err) {
      if (err.name && err.name === 'ValidationError') {
        res.status(400);
      } else {
        res.status(503);
      }
      return res.json({error: err}); 
    }
    return res.json({id: id});
  });
}

function send(req, res) {
  letters.send(req.params.id, function (err, senderName) {
    if (err) {
      if (err.message && err.message === "No senders left") {
        res.status(503);
      } else if (err.message && err.message === 'Not found') {
        res.status(404);
      }

      return res.json({success: false, error: err});
    }
    return res.json({success: true, sender: senderName});
  });
}

module.exports = {
  create: create,
  send: send
};
