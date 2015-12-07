var mongodb = require('mongodb');

var connection;

function connect(errCallback, callback) {
  if (connection) {
    return callback(connection);
  }

  mongodb.MongoClient.connect(process.env.MONGOLAB_URI, function (err, clientConnection) {
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
    collection.findOne({ _id: new mongodb.ObjectId(letterId) }, callback);
  });
}

function createLetter(letter, callback) {
  connect(callback, function (conn) {
    var collection = conn.collection('letters');
    collection.insert(letter, function (err, result) {
      if (err) { return callback(err); }
      return callback(null, result[0]._id);
    });
  });
}

module.exports = {
  getLetter: getLetter,
  createLetter: createLetter
};
