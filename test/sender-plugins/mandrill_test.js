var expect      = require('chai').expect;
var sinon       = require('sinon');

var mandrill    = require('../../lib/sender-plugins/mandrill');

var mandrillApi = require('mandrill-api/mandrill');

describe('sender-plugins/mandrill send', function () {
  var sendStub;

  beforeEach(function () {
    sendStub = sinon.stub().yields();

    sinon.stub(mandrillApi, 'Mandrill', function () {
      this.messages = {
        send: sendStub
      };
    });
  });

  afterEach(function () {
    mandrillApi.Mandrill.restore();
  });

  it('should call mandrill.send with correct arguments', function () {
    var letter = {
      to: ['a@example.com', 'b@example.com'],
      toname: ['A A', 'B B'],
      from: 'c@example.com',
      fromname: 'C C',
      subject: 'SUBJECT',
      text: 'TEXT',
      html: '<a>HTML</a>',
      bcc: ['d@example.com'],
      cc: ['e@example.com'],
      replyto: 'me@example.com'
    };

    mandrill.send(letter, function (err) {
      expect(sendStub.callCount).to.equal(1);
    });
  });
});
