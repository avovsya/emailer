var expect     = require('chai').expect;
var sinon      = require('sinon');
var proxyquire = require('proxyquire').noPreserveCache();

var mongodb    = {
  GridStore: function () {}
};
var db         = proxyquire('../../lib/db', { mongodb: mongodb });
var config     = require('config');

describe('db', function () {
  var connectionStub = {};
  var collectionStub = {};
  var gridStoreOpen, gridStoreWrite, gridStoreClose, gridStoreSeek, gridStoreRead;

  beforeEach(function () {
    sinon.stub(config, 'get').withArgs('mongoConnectionString').returns('MONGOCONNSTRING');

    collectionStub.findOne = sinon.stub().yields();
    collectionStub.insert = sinon.stub().yields();
    collectionStub.update = sinon.stub().yields();

    gridStoreOpen = sinon.stub();
    gridStoreWrite = sinon.stub();
    gridStoreClose = sinon.stub();
    gridStoreSeek = sinon.stub();
    gridStoreRead = sinon.stub();

    connectionStub.collection = sinon.stub().returns(collectionStub);

    mongodb.MongoClient = {
      connect: sinon.stub().yields(null, connectionStub)
    };

    sinon.stub(mongodb, 'GridStore', function () {
      this.open = gridStoreOpen;
      this.write = gridStoreWrite;
      this.close = gridStoreClose;
      this.seek = gridStoreSeek;
      this.read = gridStoreRead;
    });

    mongodb.ObjectId = function (id) { this.val = id || 'NEWID'; };
  });

  afterEach(function () {
    config.get.restore();
    mongodb.GridStore.restore();
  });

  describe('getLetter', function () {
    it('should establish connection to database and return error if it occured', function (done) {
      mongodb.MongoClient.connect.yields('ERROR');
      db.getLetter('ID', function (err, letter) {
        expect(err).to.equal('ERROR');
        return done();
      });
    });

    it('should establish connection to the database', function (done) {
      db.getLetter('ID', function (err, letter) {
        expect(err).to.equal(undefined);
        expect(mongodb.MongoClient.connect.callCount).to.equal(1);
        return done();
      });
    });

    it('should search collection for letter ID and return result', function (done) {
      collectionStub.findOne.yields(null, 'LETTER');
      db.getLetter('ID', function (err, letter) {
        expect(letter, 'LETTER');
        expect(connectionStub.collection.args[0][0]).to.equal('letters');
        expect(collectionStub.findOne.args[0][0]).to.deep.equal({ _id: {val: 'ID'} });
        return done();
      });
    });
  });

  describe('createLetter', function () {
    it('should return error if it occured', function (done) {
      collectionStub.insert.yields('ERROR');
      db.createLetter('LETTER', function (err, letter) {
        expect(err).to.equal('ERROR');
        expect(connectionStub.collection.callCount).to.equal(1);
        expect(connectionStub.collection.args[0][0]).to.equal('letters');
        expect(collectionStub.insert.callCount).to.equal(1);
        expect(collectionStub.insert.args[0][0]).to.equal('LETTER');
        return done();
      });
    });

    it('should insert letter to collection and return letter id', function (done) {
      collectionStub.insert.yields(null, {ops:[{_id: 'RESULTID'}]});
      db.createLetter('LETTER', function (err, letter) {
        expect(collectionStub.insert.callCount).to.equal(1);
        expect(collectionStub.insert.args[0][0]).to.equal('LETTER');
        expect(letter).to.equal('RESULTID');
        return done();
      });
    });
  });

  describe('addLetterAttachmentId', function () {
    it('should return error if it occured', function (done) {
      collectionStub.update.yields('ERROR');
      db.addLetterAttachmentId('LETTERID', 'ATTACHID', function (err, modifiedRecordsCount) {
        expect(err).to.equal('ERROR');
        return done();
      });
    });

    it('should update letter attachment list', function (done) {
      collectionStub.update.yields(null, 42);
      db.addLetterAttachmentId('LETTERID', 'ATTACHID', function (err, modifiedRecordsCount) {
        expect(collectionStub.update.callCount).to.equal(1);
        expect(collectionStub.update.args[0][0]).to.deep.equal({ _id: {val: 'LETTERID'} });
        expect(collectionStub.update.args[0][1]).to.deep.equal({ $push: {attachments: 'ATTACHID'} });
        expect(modifiedRecordsCount).to.equal(42);
        return done();
      });
    });
  });

  describe('saveFile', function () {
    it('should create new GridStore passing the new Id for the file', function (done) {
      gridStoreOpen.yields();
      gridStoreWrite.yields();
      gridStoreClose.yields();
      db.saveFile('CONTENT', function (err, id) {
        expect(mongodb.GridStore.callCount).to.equal(1);
        expect(mongodb.GridStore.args[0][0]).to.deep.equal(connectionStub);
        expect(mongodb.GridStore.args[0][1]).to.deep.equal({val: 'NEWID'});
        expect(mongodb.GridStore.args[0][2]).to.equal('w');
        return done();
      });
    });

    it('should return new file ID if successfully saved', function (done) {
      gridStoreOpen.yields();
      gridStoreWrite.yields();
      gridStoreClose.yields();
      db.saveFile('CONTENT', function (err, id) {
        expect(id).to.deep.equal({val: 'NEWID'});
        return done();
      });
    });

    it('should return error if error occured when GridStore.open', function (done) {
      gridStoreOpen.yields('ERROROPEN');
      db.saveFile('CONTENT', function (err, id) {
        expect(gridStoreOpen.callCount).to.equal(1);
        expect(gridStoreWrite.callCount).to.equal(0);
        expect(gridStoreClose.callCount).to.equal(0);
        expect(err).to.equal('ERROROPEN');
        return done();
      });
    });

    it('should return error if error occured when GridStore.write', function (done) {
      gridStoreOpen.yields();
      gridStoreWrite.yields('ERRORWRITE');
      db.saveFile('CONTENT', function (err, id) {
        expect(gridStoreOpen.callCount).to.equal(1);
        expect(gridStoreWrite.callCount).to.equal(1);
        expect(gridStoreClose.callCount).to.equal(0);
        expect(err).to.equal('ERRORWRITE');
        return done();
      });
    });

    it('should return error if error occured when GridStore.close', function (done) {
      gridStoreOpen.yields();
      gridStoreWrite.yields();
      gridStoreClose.yields('ERRORCLOSE');
      db.saveFile('CONTENT', function (err, id) {
        expect(gridStoreOpen.callCount).to.equal(1);
        expect(gridStoreWrite.callCount).to.equal(1);
        expect(err).to.equal('ERRORCLOSE');
        return done();
      });
    });

  });

  describe('getFile', function () {
    it('should create new GridStore passing the new Id for the file', function (done) {
      gridStoreOpen.yields();
      gridStoreSeek.yields();
      gridStoreRead.yields(null, new Buffer('test'));
      db.getFile('ID', function (err, id) {
        expect(mongodb.GridStore.callCount).to.equal(1);
        expect(mongodb.GridStore.args[0][0]).to.deep.equal(connectionStub);
        expect(mongodb.GridStore.args[0][1]).to.deep.equal('ID');
        expect(mongodb.GridStore.args[0][2]).to.equal('r');
        return done();
      });
    });

    it('should return file content if successfully saved', function (done) {
      gridStoreOpen.yields();
      gridStoreSeek.yields();
      gridStoreRead.yields(null, new Buffer('CONTENT'));
      db.getFile('ID', function (err, content) {
        expect(content).to.deep.equal('CONTENT');
        return done();
      });
    });

    it('should return error if error occured when GridStore.open', function (done) {
      gridStoreOpen.yields('ERROROPEN');
      gridStoreSeek.yields();
      gridStoreRead.yields();
      db.getFile('ID', function (err, id) {
        expect(gridStoreOpen.callCount).to.equal(1);
        expect(gridStoreSeek.callCount).to.equal(0);
        expect(gridStoreRead.callCount).to.equal(0);
        expect(err).to.equal('ERROROPEN');
        return done();
      });
    });

    it('should return error if error occured when GridStore.read', function (done) {
      gridStoreOpen.yields();
      gridStoreSeek.yields();
      gridStoreRead.yields('ERRORREAD');
      db.getFile('ID', function (err, id) {
        expect(gridStoreOpen.callCount).to.equal(1);
        expect(gridStoreSeek.callCount).to.equal(1);
        expect(gridStoreRead.callCount).to.equal(1);
        expect(err).to.equal('ERRORREAD');
        return done();
      });
    });
  });
});
