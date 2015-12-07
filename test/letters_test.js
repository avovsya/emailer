var expect  = require('chai').expect;
var sinon   = require('sinon');

var letters = require('../lib/letters');

var senders = require('../lib/senders');
var db      = require('../lib/db');

describe('lib/letters', function () {
  describe('validate', function () {
    it('should return success for correct letter', function() {
      var letter = {
        to: ['a@example.com', 'b@example.com'],
        toname: ['A A', 'B B'],
        from: 'c@example.com',
        fromname: 'C C',
        subject: 'SUBJECT',
        text: 'TEXT',
        html: '<a>HTML</a>',
        replyto: 'me@example.com'
      };

      letters.validate(letter, function (err, val) {
        expect(err).to.equal(null);
      });
    });

    it('should fail for incorrect format', function() {
      var letter = {
        to: 'a@example.com',
        toname: 'A A',
        from: 'example.com',
        fromname: 42,
        subject: 42,
        text: 42,
        html: 42,
        bcc: 'd@example.com',
        cc: 'e@example.com',
        replyto: 'example.com'
      };


      letters.validate(letter, function (err, val) {
        expect(err).to.not.equal(null);
        expect(err.name).to.equal('ValidationError');
        expect(err.details.length).to.equal(10);
      });
    });
  });

  describe('send', function () {
    beforeEach(function () {
      sinon.stub(senders, 'get');
      sinon.stub(db, 'getLetter');
    });

    afterEach(function () {
      senders.get.restore();
      db.getLetter.restore();
    });

    it('should send provided letter to the first available sender', function (done) {
      var sender1 = {
        name: 'sender1',
        send: sinon.stub().yields()
      };

      var sender2 = {
        name: 'sender1',
        send: sinon.stub().yields()
      };

      var letter = {
        to: ['a@example.com', 'b@example.com'],
        toname: ['A A', 'B B'],
        from: 'c@example.com',
        fromname: 'C C',
        subject: 'SUBJECT',
        text: 'TEXT',
        html: '<a>HTML</a>',
        replyto: 'me@example.com'
      };

      senders.get.returns([sender1, sender2]);
      db.getLetter.yields(null, letter);

      letters.send('LETTERID', function (err) {
        expect(err).to.equal(null);
        expect(db.getLetter.callCount).to.equal(1);
        expect(db.getLetter.args[0][0]).to.equal('LETTERID');
        expect(sender1.send.calledOnce).to.equal(true);
        expect(sender1.send.args[0][0]).to.deep.equal(letter);
        expect(sender2.send.callCount).to.equal(0);
        return done();
      });
    });

    it('should send provided letter to the second available sender if first fails', function (done) {
      var sender1 = {
        name: 'sender1',
        send: sinon.stub().yields('ERROR')
      };

      var sender2 = {
        name: 'sender1',
        send: sinon.stub().yields()
      };

      var letter = {
        to: ['a@example.com', 'b@example.com'],
        toname: ['A A', 'B B'],
        from: 'c@example.com',
        fromname: 'C C',
        subject: 'SUBJECT',
        text: 'TEXT',
        html: '<a>HTML</a>',
        replyto: 'me@example.com'
      };

      senders.get.returns([sender1, sender2]);
      db.getLetter.yields(null, letter);

      letters.send('LETTERID', function (err) {
        expect(err).to.equal(null);
        expect(db.getLetter.callCount).to.equal(1);
        expect(db.getLetter.args[0][0]).to.equal('LETTERID');
        expect(sender1.send.calledOnce).to.equal(true);
        expect(sender1.send.args[0][0]).to.deep.equal(letter);
        expect(sender2.send.calledOnce).to.equal(true);
        expect(sender2.send.args[0][0]).to.deep.equal(letter);
        return done();
      });
    });

    it('should return error if all senders failed', function (done) {
      var sender1 = {
        name: 'sender1',
        send: sinon.stub().yields('ERROR')
      };

      var sender2 = {
        name: 'sender1',
        send: sinon.stub().yields('ERROR')
      };

      var letter = {
        to: ['a@example.com', 'b@example.com'],
        toname: ['A A', 'B B'],
        from: 'c@example.com',
        fromname: 'C C',
        subject: 'SUBJECT',
        text: 'TEXT',
        html: '<a>HTML</a>',
        replyto: 'me@example.com'
      };

      senders.get.returns([sender1, sender2]);
      db.getLetter.yields(null, letter);

      letters.send('LETTERID', function (err) {
        expect(sender1.send.calledOnce).to.equal(true);
        expect(sender2.send.calledOnce).to.equal(true);
        expect(err.message).to.equal('No senders left');
        return done();
      });
    });
  });

  describe('create', function () {
    beforeEach(function () {
      sinon.stub(db, 'createLetter');
    });

    afterEach(function () {
      db.createLetter.restore();
    });

    it('should fail for incorrect format', function(done) {
      var letter = {
        to: 'a@example.com',
        toname: 'A A',
        from: 'example.com',
        fromname: 42,
        subject: 42,
        text: 42,
        html: 42,
        bcc: 'd@example.com',
        cc: 'e@example.com',
        replyto: 'example.com'
      };


      letters.create(letter, function (err, val) {
        expect(err).to.not.equal(null);
        expect(err.name).to.equal('ValidationError');
        expect(err.details.length).to.equal(10);
        return done();
      });
    });

    it('should save letter to DB and return letter id', function(done) {
      var letter = {
        to: ['a@example.com', 'b@example.com'],
        toname: ['A A', 'B B'],
        from: 'c@example.com',
        fromname: 'C C',
        subject: 'SUBJECT',
        text: 'TEXT',
        html: '<a>HTML</a>',
        replyto: 'me@example.com'
      };

      db.createLetter.yields(null, 'LETTERID');

      letters.create(letter, function (err, id) {
        expect(err).to.equal(null);
        expect(db.createLetter.callCount).to.equal(1);
        expect(db.createLetter.args[0][0]).to.deep.equal(letter);
        expect(id).to.equal('LETTERID');
        return done();
      });
    });

    it('should return error if DB errors', function(done) {
      var letter = {
        to: ['a@example.com', 'b@example.com'],
        toname: ['A A', 'B B'],
        from: 'c@example.com',
        fromname: 'C C',
        subject: 'SUBJECT',
        text: 'TEXT',
        html: '<a>HTML</a>',
        replyto: 'me@example.com'
      };

      db.createLetter.yields('ERROR');

      letters.create(letter, function (err, id) {
        expect(err).to.equal('ERROR');
        return done();
      });
    });
  });
});
