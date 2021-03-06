var expect  = require('chai').expect;
var sinon   = require('sinon');
// var proxyquire = require('proxyquire').preserveCache();

var letters = require('../../lib/letters');

var senders = require('../../lib/senders');
var db      = require('../../lib/db');

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
      sinon.stub(db, 'createLetter');
      sinon.stub(db, 'getFile');
    });

    afterEach(function () {
      senders.get.restore();
      db.getLetter.restore();
      db.createLetter.restore();
      db.getFile.restore();
    });

    it('should send provided letter to the first available sender and return sender name', function (done) {
      var sender1 = {
        name: 'sender1',
        send: sinon.stub().yields()
      };

      var sender2 = {
        name: 'sender2',
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

      letters.send('LETTERID', function (err, senderName) {
        expect(err).to.equal(null);
        expect(db.getLetter.callCount).to.equal(1);
        expect(db.getLetter.args[0][0]).to.equal('LETTERID');
        expect(sender1.send.calledOnce).to.equal(true);
        expect(sender1.send.args[0][0]).to.deep.equal(letter);
        expect(sender2.send.callCount).to.equal(0);
        expect(senderName).to.equal('sender1');
        return done();
      });
    });

    it('should send provided letter to the second available sender if first fails', function (done) {
      var sender1 = {
        name: 'sender1',
        send: sinon.stub().yields('ERROR')
      };

      var sender2 = {
        name: 'sender2',
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

      letters.send('LETTERID', function (err, senderName) {
        expect(err).to.equal(null);
        expect(db.getLetter.callCount).to.equal(1);
        expect(db.getLetter.args[0][0]).to.equal('LETTERID');
        expect(sender1.send.calledOnce).to.equal(true);
        expect(sender1.send.args[0][0]).to.deep.equal(letter);
        expect(sender2.send.calledOnce).to.equal(true);
        expect(sender2.send.args[0][0]).to.deep.equal(letter);
        expect(senderName).to.equal('sender2');
        return done();
      });
    });

    it('should send letter including attachments', function (done) {
      var sender1 = {
        name: 'sender1',
        send: sinon.stub().yields()
      };

      db.getFile.onCall(0).yields(null, 'ATTACHMENT1');
      db.getFile.onCall(1).yields(null, 'ATTACHMENT2');

      var letter = {
        to: ['a@example.com', 'b@example.com'],
        toname: ['A A', 'B B'],
        from: 'c@example.com',
        fromname: 'C C',
        subject: 'SUBJECT',
        text: 'TEXT',
        html: '<a>HTML</a>',
        replyto: 'me@example.com',
        attachments: ['ATTACHID1', 'ATTACHID2']
      };

      senders.get.returns([sender1]);
      db.getLetter.yields(null, letter);

      letters.send('LETTERID', function (err, senderName) {
        expect(err).to.equal(null);

        expect(db.getFile.callCount).to.equal(2);
        expect(db.getFile.args[0][0]).to.equal('ATTACHID1');
        expect(db.getFile.args[1][0]).to.equal('ATTACHID2');

        expect(sender1.send.args[0][0].attachments).to.deep.equal([{
          name: 'ATTACHID1',
          content: 'ATTACHMENT1'
        }, {
          name: 'ATTACHID2',
          content: 'ATTACHMENT2'
        }]);
        return done();
      });
    });

    it('should return error if getting attachments from db fails', function (done) {
      var sender1 = {
        name: 'sender1',
        send: sinon.stub().yields()
      };

      db.getFile.onCall(0).yields(null, 'ATTACHMENT1');
      db.getFile.onCall(1).yields('ERROR');

      var letter = {
        to: ['a@example.com', 'b@example.com'],
        toname: ['A A', 'B B'],
        from: 'c@example.com',
        fromname: 'C C',
        subject: 'SUBJECT',
        text: 'TEXT',
        html: '<a>HTML</a>',
        replyto: 'me@example.com',
        attachments: ['ATTACHID1', 'ATTACHID2']
      };

      senders.get.returns([sender1]);
      db.getLetter.yields(null, letter);

      letters.send('LETTERID', function (err, senderName) {
        expect(err).to.equal('ERROR');

        expect(sender1.send.callCount).to.equal(0);
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
      sinon.stub(db, 'getLetter');
    });

    afterEach(function () {
      db.createLetter.restore();
      db.getLetter.restore();
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

  describe('addAttachment', function () {
    beforeEach(function () {
      sinon.stub(db, 'saveFile');
      sinon.stub(db, 'addLetterAttachmentId');
    });

    afterEach(function () {
      db.saveFile.restore();
      db.addLetterAttachmentId.restore();
    });

    it('should save attachment to DB', function(done) {
      db.saveFile.yields(null, 'ATTACHID');
      db.addLetterAttachmentId.yields(null, {result: {nModified: 1}});

      letters.addAttachment('LETTERID', 'CONTENT', 'FILENAME', function (err, id) {
        expect(err).to.equal(undefined);
        expect(db.saveFile.callCount).to.equal(1);
        expect(db.saveFile.args[0][0]).to.equal('FILENAME');
        expect(db.saveFile.args[0][1]).to.equal('CONTENT');
        return done();
      });
    });

    it('should return error if saving file fails', function(done) {
      db.saveFile.yields('ERRORSAVE');
      db.addLetterAttachmentId.yields(null, {result: {nModified: 1}});

      letters.addAttachment('LETTERID', 'CONTENT', 'FILENAME', function (err, id) {
        expect(err).to.equal('ERRORSAVE');
        expect(db.saveFile.callCount).to.equal(1);
        expect(db.addLetterAttachmentId.callCount).to.equal(0);
        return done();
      });
    });

    it('should add attachment id to letter', function(done) {
      db.saveFile.yields(null, 'FILENAME');
      db.addLetterAttachmentId.yields(null, {result: {nModified: 1}});

      letters.addAttachment('LETTERID', 'CONTENT', 'FILENAME', function (err, id) {
        expect(err).to.equal(undefined);
        expect(db.saveFile.callCount).to.equal(1);
        expect(db.addLetterAttachmentId.callCount).to.equal(1);
        expect(db.addLetterAttachmentId.args[0][0]).to.equal('LETTERID');
        expect(db.addLetterAttachmentId.args[0][1]).to.equal('FILENAME');
        return done();
      });
    });

    it('should return error if adding attachment id to letter failed', function(done) {
      db.saveFile.yields(null, 'ATTACHID');
      db.addLetterAttachmentId.yields('ERRORATTACH');

      letters.addAttachment('LETTERID', 'CONTENT', 'FILENAME', function (err, id) {
        expect(err).to.equal('ERRORATTACH');
        return done();
      });
    });

    it('should return Not Found error if number of updated letters equals 0', function(done) {
      db.saveFile.yields(null, 'ATTACHID');
      db.addLetterAttachmentId.yields(null, {result: {nModified: 0}});

      letters.addAttachment('LETTERID', 'CONTENT', 'FILENAME', function (err, id) {
        expect(err.message).to.equal('Not Found');
        return done();
      });
    });
  });
});
