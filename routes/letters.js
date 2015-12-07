var letters = require('../lib/letters');

function create(req, res) {
  letters.create(req.body, function (err, id) {
    if (err) return res.json({error: err});
    return res.json({id: id});
  });
}

function send(req, res) {
  letters.send(req.params.id, function (err, senderName) {
    if (err) return res.json({success: false, error: err});
    return res.json({success: true, sender: senderName});
  });
}

module.exports = {
  create: create,
  send: send
};
