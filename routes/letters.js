var letters = require('../lib/letters');

function create(req, res) {
  letters.create(req.body, function (err, id) {
    // TODO if validation error return 400
    if (err) return res.json({error: err});
    return res.json({id: id});
  });
}

function send(req, res) {
  letters.send(req.params.id, function (err, senderName) {
    // TODO return 503 if all senders failed
    if (err) return res.json({success: false, error: err});
    return res.json({success: true, sender: senderName});
  });
}

module.exports = {
  create: create,
  send: send
};
