# SocialStats

This project is a work in progress.  I will update the readme as the project develops.

## Project Goals

1. Allow members of our DevRel team to view their Twitter statistics
1. Demonstrate how to test and build CI/CD (Continuous Integration/Continuous Delivery) Pipelines for serverless applications (DevOps!)

## About the Architecture

The app is built using a serverless architecture using MongoDB Stitch.  The app consists of serverless functions, a webhook, and static pages.

### config directory

Details coming soon.

## Automated Tests

The app is tested with a combination of automated unit, integration, and ui tests.  All tests are located in the [tests](/tests) directory.

To execute all of the tests locally, you will need to do the following:

1. Create a MongoDB database specifically for your development and testsing.  The easiset way to do this is using [MongoDB Atlas](http://bit.ly/MDB_Atlas), which has a perpetually free tier that will be sufficient for testing.  Be sure to whitelist your IP address and create a database user for your tests.
1. Create a MongoDB Stitch application. (More details coming soon)
1. Create a file named `test.env` inside of the `config` directory.  The file should contain values for the following constants:
    - DB_USERNAME:  the username for the MongoDB database you are using for development and testing
    - DB_PASSWORD: the password associated with the above account.
    - CLUSTER_URI: the URI for your MongoDB cluster.  For example:  cluster0-jhus0.mongodb.net
    - STITCH_APP_ID: the ID of the Stitch app you are using for development and testing. For example:  twitterstats-vpxim
    - URL: the URL for your Stitch app.  For example:  https://twitterstats-vpxim.mongodbstitch.com
1. Run `npm run start` to run the tests using the watch option (run tests that have been recently updated). Run `env-cmd -f ./config/test.env jest --runInBand` to run all of the tests.

Many of the tests utilize constants from [constants.js](/tests/constants.js).

### Unit Tests

Unit tests for the serverless functions and the webhook are located in [tests/unit](/tests/unit).  

The tests are built using [Jest](https://jestjs.io/).  The tests are completely independent of each other and do not touch a real database.  Instead, the tests use mocks to simulate interactions with the database as well as interactions with other pieces of the system.

### Integration Tests

Integration tests are located in [tests/integration](/tests/integration).

The tests are built using [Jest](https://jestjs.io/).  The tests interact with the test database, so the tests cannot be run in parallel. These tests interact with various pieces of the app including functions and the database.

### UI Tests

UI tests are located in [tests/ui](/tests/ui).

The tests are built using [Jest](https://jestjs.io/) and [Selenium](https://www.selenium.dev).  The tests interact with the test database, so the tests cannot be run in parallel.  

The tests currently test uploading a CSV file that contains stats about Tweets.  The CSV files are stored in [tests/ui/files](/tests/ui/files).

## About the Builds

This project using Travis CI for continuous integration/continuous deployment.  You can view the builds at https://travis-ci.org/github/mongodb-developer/SocialStats.
