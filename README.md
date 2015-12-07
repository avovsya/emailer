# Emailer
Simple send email service

# Running locally
Install all dependencies first with `npm install`
Then start application with `npm start`

If you want configuration to be accessible from .env file use `heroku local web`

# Running tests
Install dependencies first with `npm install`
Run `npm test` in a project root directory

# Configuration
Configuration is stored in environment variables.
On a dev environment this variables can be provided in .env file in a project root directory.

## Required environment variables
* MONGOLAB_URI - uri to MongoDB instance
* MANDRILL_API_KEY - Mandrill application key
* SENDGRID_USER - Sendgrid user name
* SENDGRID_PASSWORD - Sendgrid user password

## Optionan environment variables
* PORT - port on which to run service
