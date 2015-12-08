var mongodb = require('mongodb');
var config  = require('config');

var connection;

function connect(errCallback, callback) {
  if (connection) {
    return callback(connection);
  }

  mongodb.MongoClient.connect(config.get('mongoConnectionString'), function (err, clientConnection) {
    if (err) {
      return errCallback(err);
    }
    connection = clientConnection;
    return callback(connection);
  });
}

function getLetter(letterId, callback) {
  connect(callback, function (conn) {
    var collection = conn.collection('letters');
    var id;
    try {
      id = new mongodb.ObjectId(letterId);
    } catch(e) {
      return callback(new Error("Not found"));
    }
    collection.findOne({ _id: id }, callback);
  });
}

function createLetter(letter, callback) {
  connect(callback, function (conn) {
    var collection = conn.collection('letters');
    collection.insert(letter, function (err, result) {
      if (err) { return callback(err); }
      return callback(null, result.ops[0]._id);
    });
  });
}

module.exports = {
  getLetter: getLetter,
  createLetter: createLetter
};
