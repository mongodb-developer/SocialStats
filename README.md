# SocialStats

This app allows you to track team stats for social media.

Table of Contents
* [Project Goals](#project-goals)
* [Demo of App and CI/CD Pipeline](#demo-of-app-and-cicd-pipeline)
* [About the Architecture](#about-the-architecture)
* [Project Variables](#project-variables)
* [Automated Tests](#automated-tests)
* [CI/CD](#cicd-pipeline)
* [Automated Deployments](#automated-deployments)
* [Travis CI Builds](#travis-ci-builds)
* [GitHub Repos](#github-repos)
* [Configuring the App](#configuring-the-app)


## Project Goals

1. Allow members of our DevRel team to view Twitter statistics individually and in aggregate
1. Demonstrate how to test and build CI/CD (Continuous Integration/Continuous Delivery) Pipelines for serverless applications built on MongoDB Stitch

## Demo of App and CI/CD Pipeline

If you prefer to learn by video, [check out the webinar](https://www.mongodb.com/presentations/devops--mongodb-serverless--your-success) I gave in April 2020 entitled "DevOps + MongoDB Serverless = 😍". In the webinar, I give a demo of this app and explain how the CI/CD pipeline is configured.

[![DevOps + MongoDB Serverless = 😍 Webinar Screenshot](/images/webinar.png "DevOps + MongoDB Serverless = 😍 Webinar Screenshot")](https://www.mongodb.com/presentations/devops--mongodb-serverless--your-success)

## App Functionality

This is a super basic, super ugly app.  But it works.  The app currently consists of a page that allows users to upload their Tweet statistics spreadsheet (users can get a copy of this spreadsheet by visiting https://analytics.twitter.com/user/YOUR_HANDLE_HERE/tweets and choosing to download 28 days of stats by Tweet) and a dashboard where you can view charts about the Tweets.

The Upload page:

![Upload page](/images/upload.png "Upload page")

The Charts Dashboard:

![Dashboard](/images/dashboard.png "Dashboard")


## About the Architecture

The app is built using a serverless architecture using MongoDB Stitch.  The app consists of serverless functions, a static web page, and 
a dashboard built in MongoDB Charts.

![App Architecture Diagram](/images/architecture.png "App Architecture Diagram")

When a user accesses the `index.html` page, they are accessing the `index.html` page that is hosted by Stitch.  

When a user uploads their CSV file with all of their Twitter stats, `index.html` encodes the CSV files and calls the `processCSV` serverless function.  That function is in charge of decoding the CSV file and passing the results to the `storeCsvInDb` serverless function.  

The `storeCsvInDb` function calls the `removeBreakingCharacters` function, which is a helper function that simply removes any bad characters from the Tweets.  That function 
 passes the results back to `storeCsvInDb`.

`storeCsvInDB` then converts the cleaned Tweet statistics to JSON documents and stores them in MongoDB Atlas.

Then the results are passed back up the chain and ultimately displayed on the webpage.

At a high level, the `index.html` file hosted on Stitch calls a series of Stitch serverless functions to store information in a database hosted on Atlas.

When we view the dashboard with all of the charts showing a summary of our Tweet statistics, we are accessing a MongoDB Charts dashboard.  The dashboard pulls data from MongoDB Atlas and displays it.


## Project Variables

The following is a list of variables you should add to config files and your Travis CI builds.  An explanation of where to set these variables is described in detail in the following sections.

    * DB_USERNAME:  the username for the MongoDB database you are using for development and testing
    * DB_PASSWORD: the password associated with the above account
    * CLUSTER_URI: the URI for your MongoDB cluster.  For example:  cluster0-ffee0.mongodb.net
    * STITCH_APP_ID: the ID of the Stitch app you are using for development and testing. For example:  twitterstats-asdf
    * URL: the URL for your Stitch app.  For example:  https://twitterstats-asdf.mongodbstitch.com

## Automated Tests

The app is tested with a combination of automated unit, integration, and ui tests.  All tests are located in the [tests](/tests) directory.

Many of the tests utilize constants from [constants.js](/tests/constants.js).

### Local Test Execution

To execute all of the tests locally, you will need to do the following:

1. Follow the steps in the [Configuring the App](#configuring-the-app) section below to setup your Dev environment.
1. Create a file named `test.env` inside of the `config` directory.  The file should contain values for each of the variables in [Project Variables](#project-variables).
1. Run the tests using one of the following commands:
   - `npm run start` Run the tests using the watch option, which will run tests that have been recently updated. 
   - `env-cmd -f ./config/test.env jest --runInBand` Run all of the tests. 
   - `env-cmd -f ./config/test.env jest /tests/unit --runInBand` Run just the unit tests.

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


## CI/CD Pipeline

I have created a CI/CD (continuous integration/continuous deployment) pipeline for this app.  

My pipeline has four stages:

1. **Local Machine**: My local machine is where I do my development.  I can write serverless functions and unit test them here.  I can also create web pages and view them locally.  
1. **Development**:  When I’m ready to see how it all works together, I’m going to put the code in my Development stage.  The Development stage is just for me and my code.  Every developer will have their own Development stage. I can manually test my app in this stage.
1.  **Staging**:  When I feel good about my code, I can push it to Staging.  Staging is a place for all of my teammates to merge our code together and see what it will look like in production.  If we want to do manual testing of our team's code, this is where we do it.  If all of the automated tests pass, the code will automatically be pushed to production.
1.  **Production**: Production is the version of the app that the end users interact with. 

Below is a table the highlights what is happening at each stage and between stages.  The following subsections go into more detail.

. | Local | --> | Dev | --> | Staging | --> | Prod 
--- | --- | --- | --- | --- | --- | ---  | ---
**Git** | Local copy of the Dev Repo | `git push`  | Dev Repo (forked copy of Staging Repo) | Pull request | Staging Repo (mirrored copy of Prod Repo) | `git push` via Travis CI Staging Build. (Or manual `git push`.) | Prod Repo
**Atlas** | n/a |  Dev Project. (Or single Atlas Project with Dev cluster.) | Dev Project. (Or single Atlas Project with Dev cluster.) | Staging Project. (Or single Atlas Project with Staging cluster.) | Staging Project. (Or single Atlas Project with Staging cluster.) | Prod Project. (Or single Atlas Project with Prod cluster.) | Prod Project. (Or single Atlas Project with Prod cluster.)
**Stitch** | n/a |  `git push` triggers deploy to Dev App | Dev App | Merging of pull request triggers deploy to Staging App | Staging App  | Push from successful Staging Build triggers deploy to Prod App. (Or manual `git push` triggers build.) | Prod App
**Travis CI (runs tests—does not deploy)** | n/a | `git push` triggers build  | n/a | Merging of pull request triggers build |  n/a | Push from successful Staging build triggers build. (Or manual `git push` triggers build.) | n/a
**Automated Tests** | Unit | Unit, Integration, & UI run as part of Travis CI build | Unit, Integration, & UI | Unit, Integration, & UI run as part of Travis CI build | Unit, Integration, & UI | Unit run as part of Travis CI build | Unit

### Local

I do my development work locally on my machine.
* **Git**: I have a local copy of my development git repo.  The repo stores everything in my app including my hosted html files and my serverless functions.
* **Tests**: I can run unit tests that test my serverless functions.  Since I don’t have a way to run Stitch locally on my machine, that’s all I can test.  I need to push my code to Stitch in order to run manual tests, integration tests, and UI tests.

### Moving from Local to Development

When I'm ready to try out my code, I'm going to move from Local to Development.  

* **How to Move**: I’m going to push changes (`git push`) to my Development Repo.  
* **Git**: My Dev Repo is a forked copy of the Staging Repo.  My Dev Repo is specific to me.  My teammates have their own Dev Repos.
* **Stitch and Atlas**: One of the nice things about Stitch is that it has a [GitHub auto deploy feature](https://docs.mongodb.com/stitch/deploy/deploy-automatically-with-github/) so that whenever I push changes to an associated GitHub repo, the code in that repo is automatically deployed to my Stitch app.  That Stitch app will be associated with an Atlas project.  The Atlas project is where my database lives.  In my case, I chose to have separate Atlas projects for each stage, so I could take advantage of the free clusters in Atlas.  If you are paying for clusters, you can easily use a single Atlas project for all of your stages.  <br><br>
You might be wondering why I have a git repo specifically for Dev rather than using a single repo with a branch for each stage.  The Stitch auto deploy feature currently only allows you to auto deploy from the master branch, so I need a separate repo for each stage.
* **Travis CI and Tests**: The `git push` is going to trigger a Travis CI build.  The build is responsible for running all of my automated tests.  The build is going to run those tests against the Dev Stitch App that was just deployed.  If you have experience with CI/CD infrastructure, this might feel a little odd to you—Travis CI is responsible for running the tests but not for doing the deploy.  So, even if the tests fail, the deploy has already occurred.  This is OK since this is not production—it’s just my dev environment.  

### Development

Every developer has their own Development stage.
* **Git**: My Dev Repo is a forked copy of the Staging repo.  My Dev Repo is specific to me.  My teammates have their own Dev Repos.
* **Stitch and Atlas**: My code is deployed in my Dev Stitch App, which is connected to my Dev Atlas Project.
* **Tests**: I can choose to run manual tests against this deployment.  I can use also my local machine to run automated tests against this deployment.

### Moving from Development to Staging

When I feel like my code is well tested and I’m ready for a teammate to review it, I can move from Development to Staging.

* **How to Move**: I’m going to create a pull request.  Pull requests are a way for me to request that my code be reviewed and considered for merging into the team’s code.
If my pull request is approved, the code changes will be merged into our team's Staging Repo.  
* **Git**: The Staging Repo is a mirrored copy of the Production Repo.  We’re using separate repos so we can take advantage of Stitch auto deployments.
* **Stitch and Atlas**:  When my code is merged into the Staging Repo, it will be automatically deployed to my Staging Stitch App that is associated with my Staging Atlas Project.
* **Travis CI and Tests**: The merging of my pull request is also going to trigger a Travis CI build.  That build is gong to run all of my automated tests.  If the build passes—meaning that all of my automated tests pass—the build is going to automatically push the code changes to my Prod Repo.  I’ll discuss this more below in the section about [Moving from Staging to Prod](#moving-from-staging-to-production).

### Staging

Staging is a place for all of my teammates to merge our code together and see what it will look like in production. 

* **Git**: The Staging Repo is a mirrored copy of the Production Repo.
* **Stitch and Atlas**: My code is deployed in the Staging Stitch App, which is connected to the Staging Atlas Project. 
* **Tests**: This stage is a simulation of Production, so it’s our place to do all of our QA testing.  I can choose to run manual tests against this deployment.  If I want to run the automated tests, I can use my local machine to run the tests against this deployment.

### Moving from Staging to Production

Since we’re following the continuous deployment model, we have a ton of automated tests.  Our team has agreed that we feel confident that, if the tests pass, we are ready to deploy.

* **How to Move**: If the Staging build passes—meaning that all of the tests pass—the Staging build will automatically push the code changes to production.
So instead of having a manual `git push` or a pull request trigger our move to Production, the Staging Build does the `git push` for us.
* **Git**: The code is in the Prod git repo.
* **Stitch and Atlas**: We still have the GitHub auto deployment feature configured, so the push to the Prod Repo is going to trigger a deployment to our Prod Stitch App.  That Prod Stitch App is associated with a Prod Atlas Project where our prod data is stored.
* **Travis CI and Tests**: The push to the Prod Repo is going to trigger our Prod Build.  The Prod Build only runs the unit tests.  Recall that our integration and UI tests interact with our database, and we don’t want to mess up our Prod database, so we’re only running our unit tests.
In my case, the pipeline stops here.  You may have monitoring or other tools or tests you want to run here.  It all depends on what your team’s requirements are.

### Production

Production is the version of the app that my end users interact with. 

* **Git**: The code is in the Prod Repo.
* **Stitch and Atlas**: Our app is deployed in the Prod Stitch App, and our Prod data is in the associated Prod Atlas Project.
* **Tests**: If we want to run tests, we can use our local machines to execute unit tests against the code in the Prod Repo.

## Automated Deployments

The code is deployed to Stitch using [automated GitHub deployments](https://docs.mongodb.com/stitch/deploy/deploy-automatically-with-github/).  Since the automatated GitHub deployments currently only deploy from the master branch, we have a separate repo for each stage in the CI/CD pipeline.

## Travis CI Builds

This project uses Travis CI for builds.  You can view the builds:
* Lauren's Development Build: https://travis-ci.org/github/ljhaywar/SocialStats-Dev-Lauren
* Staging: https://travis-ci.org/github/mongodb-developer/SocialStats-Staging
* Production: https://travis-ci.org/github/mongodb-developer/SocialStats

The builds are responsible for running the appropriate automated tests and pushing code to the production GitHub repo.  Note that the builds do NOT actually deploy the app.
See the section above for how the app is deployed.

## GitHub Repos

This projects uses separate repos for each stage in the CI/CD pipeline.  You can view the repos:
* Lauren's Development Repo: https://github.com/ljhaywar/SocialStats-Dev-Lauren. This repo is a forked copy of the Staging Repo. 
* Staging Repo: https://github.com/mongodb-developer/SocialStats-Staging. This repo is a mirrored copy of the Production Repo.
* Production Repo: https://github.com/mongodb-developer/SocialStats.

### Git Tips
Since we're doing our work in the master branch of the GitHub repo, things can get a little dicey.  

Before pushing your changes to your Development Repo, I recommend pulling the latest changes from the Staging Repo:  `git pull staging master`.

When you want to squash commits in your Development Repo, rebase against staging–not your local copy–so you do not rewrite your Development Repo's history: 
1. `git pull staging master`
2. `git rebase -i staging/master`



## Configuring the App

The following steps will walk you through configuring the app for Production, Staging, and Development.

### Steps for All Stages

Complete the following steps for EACH stage AFTER setting up the Git repos as described in the sections below.

1. **Atlas**
   1. Create a new [MongoDB Atlas](http://bit.ly/MDB_Atlas) project.
   1. Create a cluster (a free cluster is fine if you are not using the app in production).
   1. Create a database user for your tests. The user should have read and write privileges.
   1. Whitelist your current IP address.
   1. [Create a MongoDB Stitch application](https://docs.mongodb.com/stitch/procedures/create-stitch-app/) in this Atlas project.  Then...
      1. Enable auto deploy.
      1. Enable hosting.
      1. [Load function dependencies](https://docs.mongodb.com/stitch/functions/upload-external-dependencies/) for the comma-separated-values npm module.
      1. Review and deploy changes to Stitch app.
1. **Charts**
   1. Activate Charts in your Atlas project.
   1. Inside of Charts, add a Data Source for your Atlas cluster.
   1. Create a dashboard.
   1. Add the 4 charts as seen in https://charts.mongodb.com/charts-twitter-stats-vzwpx/public/dashboards/82195382-6cea-4994-9283-cf2fb899c6de 
1. **Configure the App**
   1. In your code editor, open [/hosting/files/config.js](/hosting/files/config.js). 
   1. Update the file to reflect the code repos for your app.
   1. Commit and push the changes.
1. **Travis CI**
   1. Run the [Travis CI IP Whitelister](https://github.com/mongodb-developer/Travic-CI-IP-Address-Whitelister) so Travis CI can access your database hosted on Atlas.
   1. Add your repo to Travis CI (you may need to sign out and sign back in to see the repo in your list of repos).
   1. Add the variables described in [Project Variables](#project-variables) to your build's Environment Variables.
   1. Disable `build on pushed pull requests` since Stitch will not deploy on PRs. If you left this option enabled, your tests would be running against an old deployment.

### Configuring Production

Create a new git repo for your production application. You can either grab a copy of this code and push it to your repo or mirror this repo.

Then complete the steps described above in [Steps for All Stages](#steps-for-all-stages).

### Configuring Staging
 
   1. Create a new git repo for your staging application. 
   1. Since you can't create a fork of an app in the same GitHub organization, we will mirror it instead.  Create a local copy of the prod version of the repo.  Then run the following command: 
   `git push --mirror https://github.com/YourOrg/YourStagingRepo.git`
   1. Clone the Staging Repo so you can access the repo locally.
   1. Add a remote for prod:
    `git remote add prod https://github.com/YourOrg/YourProdRepo.git`
   1. Now you can push changes to staging.  You can also push changes to prod.

Then complete the steps described above in [Steps for All Stages](#steps-for-all-stages).

### Configuring Development
 
   1. Fork the staging application. 
   1. Optionally rename the forked repo.
   1. Clone the repo so you can work locally on your machine.
   1. Add a remote for staging:
    `git remote add staging https://github.com/YourOrg/YourStagingRepo.git`.

Then complete the steps described above in [Steps for All Stages](#steps-for-all-stages).
