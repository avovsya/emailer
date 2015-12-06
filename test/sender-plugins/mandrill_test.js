var expect      = require('chai').expect;
var sinon       = require('sinon');

var mandrill    = require('../../lib/sender-plugins/mandrill');

var mandrillApi = require('mandrill-api/mandrill');

describe('sender-plugins/mandrill send', function () {
  var oldMandrillKey;
  var mandrillMessages = {};

  beforeEach(function () {
    oldMandrillKey = process.env.MANDRILL_API_KEY;
    process.env.MANDRILL_API_KEY = 'MANDRILLKEY';

    mandrillMessages.send = sinon.stub();

    sinon.stub(mandrillApi, 'Mandrill', function () {
      this.messages = mandrillMessages;
    });
  });

  afterEach(function () {
    process.env.MANDRILL_API_KEY = oldMandrillKey;
    mandrillApi.Mandrill.restore();
  });

  it('should call mandrill constructor with correct API key', function () {
    mandrill.init();
    expect(mandrillApi.Mandrill.callCount).to.equal(1);
    expect(mandrillApi.Mandrill.args[0][0]).to.equal('MANDRILLKEY');
  });

  it('should call mandrill.send with correct arguments', function (done) {
    mandrillMessages.send.callsArg(1);
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

    var expectedMessage = {
      html: '<a>HTML</a>',
      text: 'TEXT',
      subject: 'SUBJECT',
      from_email: 'c@example.com',
      from_name: 'C C',
      to: [{
        email: 'a@example.com',
        name: 'A A',
        type: 'to'
      }, {
        email: 'b@example.com',
        name: 'B B',
        type: 'to'
      }],
      headers: {
        "Reply-To": "me@example.com"
      }
    };

    mandrill.send(letter, function (err) {
      expect(err).to.equal(undefined);
      expect(mandrillMessages.send.args[0][0]).to.deep.equal({
        async: false,
        message: expectedMessage
      });
      return done();
    });
  });

  it('should return error if api returned error', function (done) {
    mandrillMessages.send.callsArgWith(2, 'ERROR');
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

    mandrill.send(letter, function (err) {
      expect(err).to.equal('ERROR');
      return done();
    });
  });
});
