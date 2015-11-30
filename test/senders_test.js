var expect = require('chai').expect;

var getSenders = require('../lib/senders').get;

describe('lib/senders', function () {
  it('should return list of available senders', function() {
    var senders = getSenders();
    expect(senders).to.have.property('mandrill.js');
    expect(senders).to.have.property('sendgrid.js');
    expect(senders['mandrill.js']).to.have.property('send');
    expect(senders['sendgrid.js']).to.have.property('send');
  });
});
