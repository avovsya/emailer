# EMAILER
Simple send email service.

Demo - [emailer-challenge.herokuapp.com](http://emailer-challenge.herokuapp.com/swagger/index.html)

# DESCRIPTION
This service allows to send emails using either Mandrill or Sendgrid, providing automatic failover from one to another. Also service can be easily extended to use more email providers.

Service exposes REST API. API documentation can be found  [here](http://emailer-challenge.herokuapp.com/swagger/index.html)

## API Workflow
To support JSON as a data format of choice, with ability to send attachments and ability to use API from browser, operation of sending email was divided to 3 steps:

1. Creating letter (JSON)
2. Adding attachments (MULTIPART)
3. Sending letter (JSON)

First step will create letter and return it's ID, second allows to add files to that letter and the third step will actually send letter with one of the available email providers.

## Documentation
Full API docs are provided using Swagger UI -  [http://emailer-challenge.herokuapp.com/swagger/index.html](http://emailer-challenge.herokuapp.com/swagger/index.html).
Also Swagger provides advanced UI for executing API calls(API frontend)

If running locally docs can be found in [http://localhost:{PORT}/swagger/index.html](http://localhost:3000/swagger/index.html) 
# RUN
## Running locally
* Install dependencies with `npm install`
* Provide configuration in config/development.json
* Set NODE_ENV environment variable to 'development'
* Then start application with `npm start`

## Running tests
* Provide configuration in config/test.json
* Install dependencies with `npm install`
* Unit tests and coverage: `npm run test-unit`
* Smoke API tests: `npm run test-smoke`
* All tests: `npm test`

# CONFIGURATION
Configuration is stored in `config/` folder using .json files. `config/default.json` provided as an example

## Warning!
File `config/custom-environment-variables.json` provides a binding from environment variables to an application config.
So if you system has one of the following environment variables: **MANDRILL_KEY**, **SENDGRID_KEY** or **MONGOLAB_URI** they will be used instead of any other configuration in `config/` folder. **BE CAREFULL**

## Required configuration
* mongoConnectionString - uri to MongoDB instance
* mandrillApiKey - Mandrill API key
* sendgridApiKey - Sendgrid API key

## Environment variables
* PORT - port on which to run service

# TECH STACK
* Node.js
* Express.js as a http framework
* Input validation using Hapi Joi library
* MongoDB + Node.js mongodb-native driver for storing letters before sending them
* MongoDB GridFS for storing letter attachments
* Mocha, Chai.js, Sinon for unit testing
* Istanbul for code coverage
* Mocha, Supertest for API tests
* Swagger UI for API documentation and frontend
* Hosted on Heroku
