var expect = require('chai').expect;

var getSenders = require('../lib/senders').get;

describe('lib/senders', function () {
  it('should return list of available senders', function() {
    var senders = getSenders();
    expect(senders.length).to.equal(2);
    expect(senders[0].name).to.equal('mandrill.js');
    expect(senders[1].name).to.equal('sendgrid.js');
    expect(senders[0]).to.have.property('send');
    expect(senders[1]).to.have.property('send');
  });
});
