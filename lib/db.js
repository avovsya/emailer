var mongodb = require('mongodb');
var config  = require('config');

var connection;

function _connect(errCallback, callback) {
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
  _connect(callback, function (conn) {
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
  _connect(callback, function (conn) {
    var collection = conn.collection('letters');
    collection.insert(letter, function (err, result) {
      if (err) { return callback(err); }
      return callback(null, result.ops[0]._id);
    });
  });
}

function addLetterAttachmentId(letterId, attachmentId, callback) {
  _connect(callback, function (conn) {
    var collection = conn.collection('letters');
    collection.update({
      _id: new mongodb.ObjectId(letterId)
    }, {
      $push: {
        attachments: attachmentId
      }
    }, callback);
  });
}

function saveFile(fileName, content, callback) {
  _connect(callback, function (db) {
    var gridStore = new mongodb.GridStore(db, fileName, 'w');

    gridStore.open(function (err) {
      if(err) return callback(err);

      gridStore.write(content, function (err) {
        if(err) return callback(err);
        return gridStore.close(function (err) {
          return callback(err, fileName);
        });
      });
    });
  });
}

function getFile(fileId, callback) {
  _connect(callback, function (db) {
    var gridStore = new mongodb.GridStore(db, fileId, 'r');

    gridStore.open(function (err) {
      if(err) return callback(err);

      gridStore.seek(0, function () {
        gridStore.read(function (err, data) {
          if (err) return callback(err);
          return callback(null, data);
        });
      });
    });
  });
}

module.exports = {
  getLetter: getLetter,
  createLetter: createLetter,
  addLetterAttachmentId: addLetterAttachmentId,
  saveFile: saveFile,
  getFile: getFile
};
