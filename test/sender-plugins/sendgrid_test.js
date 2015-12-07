var expect      = require('chai').expect;
var sinon       = require('sinon');
var proxyquire  = require('proxyquire').noPreserveCache();

var sendgridApi = sinon.stub();
var sendgrid    = proxyquire('../../lib/sender-plugins/sendgrid', { sendgrid: sendgridApi });

describe('sender-plugins/sendgrid send', function () {
  var oldSendgridUserEnv, oldSendgridPasswordEnv;
  var sendgridClientStub = { Email: function () {} };

  beforeEach(function () {
    oldSendgridUserEnv = process.env.SENDGRID_USER;
    oldSendgridPasswordEnv = process.env.SENDGRID_PASSWORD;
    process.env.SENDGRID_USER = 'USER';
    process.env.SENDGRID_PASSWORD = 'PASSWORD';

    sinon.stub(sendgridClientStub, 'Email', function () {
      this.email = 'EMAIL';
    });

    sendgridApi.returns(sendgridClientStub);
  });

  afterEach(function () {
    process.env.SENDGRID_USER = oldSendgridUserEnv;
    process.env.SENDGRID_PASSWORD = oldSendgridPasswordEnv;
    sendgridClientStub.Email.restore();
  });

  it('should call sendgrid constructor with correct API credentials', function () {
    sendgrid.init();
    expect(sendgridApi.callCount).to.equal(1);
    expect(sendgridApi.args[0][0]).to.equal('USER');
    expect(sendgridApi.args[0][1]).to.equal('PASSWORD');
  });

  it('should call sendgrid.send with correct arguments sendgrid Email object', function (done) {
    sendgridClientStub.send = sinon.stub().yields(undefined, 'RESULT');
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

    sendgrid.send(letter, function (err) {
      expect(err).to.equal(undefined);
      expect(sendgridClientStub.Email.callCount).to.equal(1);
      expect(sendgridClientStub.Email.args[0][0]).to.deep.equal(letter);
      expect(sendgridClientStub.send.callCount).to.equal(1);
      expect(sendgridClientStub.send.args[0][0]).to.deep.equal({ email: 'EMAIL' });
      return done();
    });
  });

  it('should return error if api returned error', function (done) {
    sendgridClientStub.send = sinon.stub().yields('ERROR');
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

    sendgrid.send(letter, function (err) {
      expect(err).to.equal('ERROR');
      return done();
    });
  });
});
