# LINKS

My linkedin profie - [https://www.linkedin.com/in/avovsya]https://www.linkedin.com/in/avovsya)

Demo - [emailer-challenge.herokuapp.com](http://emailer-challenge.herokuapp.com/swagger/index.html)

# EMAILER
Simple send email service. Back-end implementation

# DESCRIPTION
This service allows to send emails using either Mandrill or Sendgrid, providing automatic failover from one to another. Also service can be easily extended to use more email providers.

Service exposes REST API. API documentation can be found  [here](http://emailer-challenge.herokuapp.com/swagger/index.html)

## Implementation shortcomings
I was so consumed by providing abstraction to different email services and testing, that forgot about one of the requirements - "failover to a different provider without affecting your customers". My implementation does failover but this can affect customers, because code just tries next email provider when current returns error. This can cause delays before we send response to user.

#### The correct solution 
Whenever user sends message, queue "send event" and return success to user.
Separate "sender" process consumes event from the queue and tries to send it. If send failed it can try different email provider itself or return event back to the queue, for latter processing by the different sender.
There are multiple choices of available queues(RabbitMQ, SQL, etc). Sender process can be just another Node.js application that consumes the queue and does what `lib/letter.js send` does in my solution.

## API Workflow
To support JSON as a data format of choice, with ability to send attachments and ability to use API from browser, operation of sending email was divided to 3 steps:

1. Creating letter (JSON)
2. Adding attachments (MULTIPART)
3. Sending letter (JSON)

First step will create letter and return it's ID, second allows to add files to that letter and the third step will actually send letter with one of the available email providers.

This allows to use JSON for email data along with multipart HTTP requests for attachments.
If I would do this in just one API call then the one of the following trade-offs will be made: 
1. Using form data as a format for sending email parameters. This will allow to send email parameters and file attachments in one multipart request. Convenient to use from browser but not very convenient to use from other services.
2. Using JSON inside multipart requests. In this case API will not be usable from browser JS code.

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
