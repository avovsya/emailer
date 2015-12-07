var db = require('./lib/db');
var letters = require('../lib/letters');

function create(letter, callback) {
  // validate
  // save to db
  // return id
}

function send(letterId, callback) {
  // send
  // return result
}

module.exports = {
  create: create
};
