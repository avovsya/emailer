var request = require('supertest');
var app = require('../../app');

describe('app', function () {
  describe('POST /api/1/letters', function () {
    it('should respond with letter ID if provided letter is valid', function (done) {
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

      request(app)
        .post('/api/1/letters')
        .send(letter)
        .expect(200, { id: 'ID' }, done);
    });

    it('should respond with JSON validation error if provided letter is not valid', function (done) {
      return done();
    });
  });
});
