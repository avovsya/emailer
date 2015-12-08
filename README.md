# Emailer
Simple send email service

## Documentation
API documentation is done using swagger.io

API docs can be found in [http://emailer-challenge.herokuapp.com/swagger/index.html](http://emailer-challenge.herokuapp.com/swagger/index.html)

If running locally docs can be found in [http://localhost:{PORT}/swagger/index.html](http://localhost:3000/swagger/index.html) 

## Running locally
Install dependencies with `npm install`

Provide configuration in config/development.json

Set NODE_ENV environment variable to 'development'

Then start application with `npm start`


## Running tests
Provide configuration in config/test.json

Install dependencies with `npm install`

Unit tests: `npm run test-unit`

Smoke API tests: `npm run test-smoke`

All tests: `npm test`


## Configuration
Configuration is stored in config/ folder using .json files.
config/default.json provided as an example

For deploying on Heroku it's more convenient to store configuration in
environment variables but in that case there is no single place to see
all available configuration options. Except of documentation of course,
but there is no guarantee that it always will be up to date.

### Required configuration
* mongoConnectionString - uri to MongoDB instance
* mandrillApiKey - Mandrill API key
* sendgridApiKey - Sendgrid API key

### Environment variables
* PORT - port on which to run service
