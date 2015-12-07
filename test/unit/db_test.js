var expect     = require('chai').expect;
var sinon      = require('sinon');
var proxyquire = require('proxyquire').noPreserveCache();

var mongodb    = {};
var db         = proxyquire('../../lib/db', { mongodb: mongodb });
var config     = require('config');

describe('db', function () {
  var connectionStub = {};
  var collectionStub = {};

  beforeEach(function () {
    sinon.stub(config, 'get').withArgs('mongoConnectionString').returns('MONGOCONNSTRING');

    collectionStub.findOne = sinon.stub().yields();
    collectionStub.insert = sinon.stub().yields();

    connectionStub.collection = sinon.stub().returns(collectionStub);

    mongodb.MongoClient = {
      connect: sinon.stub().yields(null, connectionStub)
    };

    mongodb.ObjectId = function (id) { this.val = id; };
  });

  afterEach(function () {
    config.get.restore();
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
      collectionStub.insert.yields(null, [{_id: 'RESULTID'}]);
      db.createLetter('LETTER', function (err, letter) {
        expect(collectionStub.insert.callCount).to.equal(1);
        expect(collectionStub.insert.args[0][0]).to.equal('LETTER');
        expect(letter).to.equal('RESULTID');
        return done();
      });
    });
  });
});
