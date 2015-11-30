var expect = require('chai').expect;
var sinon = require('sinon');

var letters = require('../lib/letters');

var senders = require('../lib/senders');

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
        bcc: ['d@example.com'],
        cc: ['e@example.com'],
        replyto: 'me@example.com',
        headers: { test: 'header' }
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
        subject: 'SUBJECT',
        text: 'TEXT',
        html: '<a>HTML</a>',
        bcc: ['d@example.com'],
        cc: ['e@example.com'],
        replyto: 'me@example.com',
        headers: { test: 'header' }
      };

      letters.validate(letter, function (err, val) {
        expect(err).to.equal(null);
      });
    });
  });

  describe('send', function () {

  });

});
