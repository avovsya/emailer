var expect  = require('chai').expect;
var sinon   = require('sinon');

var request = require('supertest');
var app     = require('../../app');

describe('app', function () {
  this.timeout(30*1000);
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
        .expect(function (res) {
          expect(res.body.id).to.match(/^[0-9abcdef]{24}$/);
        })
        .expect(200, done);
    });

    it('should respond with JSON validation error if provided letter is not valid', function (done) {
      var letter = {
        to: 'a@example.com',
        from: 'c@example.com',
        fromname: 'C C',
        text: 'TEXT',
        html: '<a>HTML</a>',
        replyto: 'me@example.com'
      };

      request(app)
        .post('/api/1/letters')
        .send(letter)
        .expect(function (res) {
          expect(res.body.error.name).to.equal('ValidationError');
          expect(res.body.error.details).to.deep.equal([{
            "context": {
              "key": "to"
            },
            "message": "\"to\" must be an array",
            "path": "to",
            "type": "array.base"
          }]);
        })
        .expect(400, done);
    });
  });

  describe('POST /api/1/letters/:id/send', function () {
    var letterId;

    before(function (done) {
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
        .expect(function (res) {
          letterId = res.body.id;
        })
        .expect(200, done);
    });

    it('should respond with success if email was sent', function (done) {
      request(app)
        .post('/api/1/letters/' + letterId + '/send')
        .expect(function (res) {
          expect(res.body.success).to.equal(true);
          expect(res.body.sender).to.be.a('string');
        })
        .expect(200, done);
    });

    it('should respond with 404 if letter id doesnt exists', function (done) {
      request(app)
        .post('/api/1/letters/111111111111111111111111/send')
        .expect(function (res) {
          expect(res.body.success).to.equal(false);
        })
        .expect(404, done);
    });

    it('should respond with 404 if letter id is incorrect', function (done) {
      request(app)
        .post('/api/1/letters/NOT-EXISTS/send')
        .expect(function (res) {
          expect(res.body.success).to.equal(false);
        })
        .expect(404, done);
    });
  });
});
