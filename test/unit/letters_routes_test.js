var expect  = require('chai').expect;
var sinon   = require('sinon');

var letters = require('../../routes/letters');
var lettersLib = require('../../lib/letters');

describe('routes/letters', function () {
  var req, res, next;
  beforeEach(function () {
    sinon.stub(lettersLib, 'create');
    sinon.stub(lettersLib, 'send');
    sinon.stub(lettersLib, 'addAttachment');

    res = {
      status: sinon.stub(),
      json: sinon.stub()
    };

    req = {};

    next = sinon.stub();
  });

  afterEach(function () {
    lettersLib.send.restore();
    lettersLib.create.restore();
    lettersLib.addAttachment.restore();
  });

  describe('create', function () {
    it('should create letter and return its ID in json format', function () {
      req.body = 'LETTER'
      lettersLib.create.yields(null, 'ID');

      letters.create(req, res, next);

      expect(lettersLib.create.callCount).to.equal(1);
      expect(lettersLib.create.args[0][0]).to.equal('LETTER');
      expect(res.json.callCount).to.equal(1);
      expect(res.json.args[0][0]).to.deep.equal({id: 'ID', success: true});
    });

    it('should return error in JSON', function () {
      req.body = 'LETTER'
      var error = new Error('ERROR')
      lettersLib.create.yields(error);

      letters.create(req, res, next);

      expect(next.callCount).to.equal(1);
      expect(next.args[0][0]).to.deep.equal(error);
    });
  });

  describe('send', function () {
    it('should send letter id and return success result and sender name', function () {
      req.params = {id: 'LETTER'};
      lettersLib.send.yields(null, 'senderName');

      letters.send(req, res, next);

      expect(lettersLib.send.callCount).to.equal(1);
      expect(lettersLib.send.args[0][0]).to.equal('LETTER');
      expect(res.json.callCount).to.equal(1);
      expect(res.json.args[0][0]).to.deep.equal({success: true, sender: 'senderName'});
    });

    it('should send letter id and return error result', function () {
      req.params = {id: 'LETTER'};
      var error = new Error('ERROR');
      lettersLib.send.yields(error);

      letters.send(req, res, next);

      expect(lettersLib.send.callCount).to.equal(1);
      expect(lettersLib.send.args[0][0]).to.equal('LETTER');
      expect(next.callCount).to.equal(1);
      expect(next.args[0][0]).to.deep.equal(error);
    });
  });

  describe('addAttachment', function () {
    it('should send attach file to letter and return success', function () {
      req.file = { buffer: 'FILE' };
      req.params = { id: 'LETTERID' };
      lettersLib.addAttachment.yields(null, 'senderName');

      letters.addAttachment(req, res, next);

      expect(lettersLib.addAttachment.callCount).to.equal(1);
      expect(lettersLib.addAttachment.args[0][0]).to.equal('LETTERID');
      expect(lettersLib.addAttachment.args[0][1]).to.equal('FILE');
      expect(res.json.callCount).to.equal(1);
      expect(res.json.args[0][0]).to.deep.equal({success: true});
    });

    it('should return error if error occured', function () {
      req.file = { buffer: 'FILE' };
      req.params = { id: 'LETTERID' };
      var error = new Error('ERROR');
      lettersLib.addAttachment.yields(error);

      letters.addAttachment(req, res, next);

      expect(next.callCount).to.equal(1);
      expect(next.args[0][0]).to.deep.equal(error);
    });

    it('should return 404 if Not Found error occured', function () {
      req.file = 'FILE';
      req.params = { id: 'LETTERID' };
      var error = new Error('Not Found');
      lettersLib.addAttachment.yields(error);

      letters.addAttachment(req, res, next);

      expect(res.status.callCount).to.equal(1);
      expect(res.status.args[0][0]).to.equal(404);
      expect(res.json.callCount).to.equal(1);
      expect(res.json.args[0][0]).to.deep.equal({success: false, error: 'Not Found'});
    });
  });
});
