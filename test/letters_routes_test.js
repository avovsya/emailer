var expect  = require('chai').expect;
var sinon   = require('sinon');

var letters = require('../routes/letters');
var lettersLib = require('../lib/letters');

describe('routes/letters', function () {
  var req, res;
  beforeEach(function () {
    sinon.stub(lettersLib, 'create');
    sinon.stub(lettersLib, 'send');

    res = {
      status: sinon.stub(),
      json: sinon.stub()
    };

    req = {};
  });

  afterEach(function () {
    lettersLib.send.restore();
    lettersLib.create.restore();
  });

  describe('create', function () {
    it('should create letter and return its ID in json format', function () {
      req.body = 'LETTER'
      lettersLib.create.yields(null, 'ID');

      letters.create(req, res);

      expect(lettersLib.create.callCount).to.equal(1);
      expect(lettersLib.create.args[0][0]).to.equal('LETTER');
      expect(res.json.callCount).to.equal(1);
      expect(res.json.args[0][0]).to.deep.equal({id: 'ID'});
    });

    it('should return error in JSON', function () {
      req.body = 'LETTER'
      lettersLib.create.yields('ERROR');

      letters.create(req, res);

      expect(res.json.callCount).to.equal(1);
      expect(res.json.args[0][0]).to.deep.equal({error: 'ERROR'});
    });
  });

  describe('send', function () {
    it('should send letter id and return success result', function () {
      req.params = {id: 'LETTER'};
      lettersLib.send.yields(null);

      letters.send(req, res);

      expect(lettersLib.send.callCount).to.equal(1);
      expect(lettersLib.send.args[0][0]).to.equal('LETTER');
      expect(res.json.callCount).to.equal(1);
      expect(res.json.args[0][0]).to.deep.equal({success: true});
    });

    it('should send letter id and return error result', function () {
      req.params = {id: 'LETTER'};
      lettersLib.send.yields('ERROR');

      letters.send(req, res);

      expect(lettersLib.send.callCount).to.equal(1);
      expect(lettersLib.send.args[0][0]).to.equal('LETTER');
      expect(res.json.callCount).to.equal(1);
      expect(res.json.args[0][0]).to.deep.equal({success: false, error: 'ERROR'});
    });
  });
});
