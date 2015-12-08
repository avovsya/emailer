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

  describe('PUT /api/1/letters/:id', function () {
    var letterId;

    before(function (done) {
      var letter = {
        to: ['artem.nomad@gmail.com'],
        toname: ['ATTACHMENT'],
        from: 'attacher@example.com',
        fromname: 'ATTACHER',
        subject: 'ATTACH FILE',
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

    it('should respond with success if attachment was added to existing letter', function (done) {
      request(app)
        .put('/api/1/letters/' + letterId)
        .attach('file', __dirname + '/../fixtures/attachment.txt')
        .expect(function (res) {
          expect(res.body.success).to.equal(true);
        })
        .expect(200, done);
    });

    it('should respond with 404 if attachment is added to non existing letter', function (done) {
      request(app)
        .put('/api/1/letters/111111111111111111111111')
        .attach('file', __dirname + '/../fixtures/attachment.txt')
        .expect(function (res) {
          expect(res.body.success).to.equal(false);
          expect(res.body.error).to.equal('Not Found');
        })
        .expect(404, done);
    });

    it('should respond with 400 there is no file in the body', function (done) {
      request(app)
        .put('/api/1/letters/' + letterId)
        .expect(function (res) {
          expect(res.body.success).to.equal(false);
          expect(res.body.error).to.equal('File not attached');
        })
        .expect(400, done);
    });

    it('POST /letters/{id}/send should successfully send file with attachment', function (done) {
      request(app)
        .post('/api/1/letters/' + letterId + '/send')
        .expect(function (res) {
          expect(res.body.success).to.equal(true);
        })
        .expect(200, done);
    });
  });
});
