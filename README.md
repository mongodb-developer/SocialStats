# SocialStats

This app allows you to track team stats for social media.

Table of Contents
* [Project Goals](#project-goals)
* [Demo of App and CI/CD Pipeline](#demo-of-app-and-cicd-pipeline)
* [Related Blog Series](#related-blog-series)
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
1. Demonstrate how to test and build CI/CD (Continuous Integration/Continuous Delivery) Pipelines for serverless applications built on MongoDB Realm

## Demo of App and CI/CD Pipeline

If you prefer to learn by video, [check out this recording](https://youtu.be/RlouET0cPsc) of a talk I gave at MongoDB.live in June 2020 entitled "DevOps + MongoDB Serverless = 😍". In the talk, I give a demo of this app and explain how the CI/CD pipeline is configured.

Note:  At the time of the recording, the GitHub repos were handled differently.  The Realm auto-deployment feature only worked from the master branch, so I had separate repos for Dev, Staging, and Prod.  Since then, the Realm team has updated the auto-deploy feature so you can deploy from any branch in a repo.  Now Dev, Staging, and Prod are stored in their own branches in this repo.  The sections below explain the new way the code is stored in more detail.

[![DevOps + MongoDB Serverless = 😍 Webinar Screenshot](/images/webinar.png "DevOps + MongoDB Serverless = 😍 Webinar Screenshot")](https://youtu.be/RlouET0cPsc)

## Related Blog Series

Check out the related blog series about DevOps for Realm Serverless Apps.  More posts coming soon.

* [How to Write Unit Tests for MongoDB Realm Serverless Functions](https://developer.mongodb.com/how-to/unit-test-realm-serverless-functions)
* [How to Write Integration Tests for MongoDB Realm Serverless Apps](https://developer.mongodb.com/how-to/integration-test-realm-serverless-apps)
* [How to Write End-to-End Tests for MongoDB Realm Serverless Apps](https://developer.mongodb.com/how-to/end-to-end-test-realm-serverless-apps)

## App Functionality

This is a super basic, super ugly app.  But it works.  The app currently consists of a page that allows users to upload their Tweet statistics spreadsheet (users can get a copy of this spreadsheet by visiting https://analytics.twitter.com/user/YOUR_HANDLE_HERE/tweets and choosing to download 28 days of stats by Tweet) and a dashboard where you can view charts about the Tweets.

The Upload page:

![Upload page](/images/upload.png "Upload page")

The Charts Dashboard:

![Dashboard](/images/dashboard.png "Dashboard")


## About the Architecture

The app is built using a serverless architecture using MongoDB Realm.  The app consists of serverless functions, a static web page, and 
a dashboard built in MongoDB Charts.

![App Architecture Diagram](/images/architecture.png "App Architecture Diagram")

When a user accesses the `index.html` page, they are accessing the `index.html` page that is hosted by Realm.  

When a user uploads their CSV file with all of their Twitter stats, `index.html` encodes the CSV files and calls the `processCSV` serverless function.  That function is in charge of decoding the CSV file and passing the results to the `storeCsvInDb` serverless function.  

The `storeCsvInDb` function calls the `removeBreakingCharacters` function, which is a helper function that simply removes any bad characters from the Tweets.  That function 
 passes the results back to `storeCsvInDb`.

`storeCsvInDB` then converts the cleaned Tweet statistics to JSON documents and stores them in MongoDB Atlas.

Then the results are passed back up the chain and ultimately displayed on the webpage.

At a high level, the `index.html` file hosted on Realm calls a series of Realm serverless functions to store information in a database hosted on Atlas.

When we view the dashboard with all of the charts showing a summary of our Tweet statistics, we are accessing a MongoDB Charts dashboard.  The dashboard pulls data from MongoDB Atlas and displays it.


## Project Variables

The following is a list of variables you should add to config files and your Travis CI builds.  An explanation of where to set these variables is described in detail in the following sections.

    * DB_USERNAME:  the username for the MongoDB database you are using for development and testing
    * DB_PASSWORD: the password associated with the above account
    * CLUSTER_URI: the URI for your MongoDB cluster.  For example:  cluster0-ffee0.mongodb.net
    * REALM_APP_ID: the ID of the Realm app you are using for development and testing. For example:  twitterstats-were
    * URL: the URL for your Realm app.  For example:  https://twitterstats-asdf.mongodbstitch.com

## Automated Tests

The app is tested with a combination of automated unit, integration, and ui tests.  For more information about how the tests are architected, check out the following blog posts:

* [How to Write Unit Tests for MongoDB Realm Serverless Functions](https://developer.mongodb.com/how-to/unit-test-realm-serverless-functions)
* [How to Write Integration Tests for MongoDB Realm Serverless Apps](https://developer.mongodb.com/how-to/integration-test-realm-serverless-apps)
* [How to Write End-to-End Tests for MongoDB Realm Serverless Apps](https://developer.mongodb.com/how-to/end-to-end-test-realm-serverless-apps)

All tests are located in the [tests](/tests) directory.  Many of the tests utilize constants from [constants.js](/tests/constants.js).

### Local Test Execution

To execute all of the tests locally, you will need to do the following:

1. Follow the steps in the [Configuring the App](#configuring-the-app) section below to setup your Dev environment.
1. Create a file named `test.env` inside of the `config` directory.  The file should contain values for each of the variables in [Project Variables](#project-variables).
1. Start the Selenium Server if you will be running the UI tests: `java -jar tests/ui/selenium-server-standalone-3.141.59.jar &`
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
**Git** | Local copy of the development branch (for example, dev-lauren) | `git push`  | development branch (for example, `dev-lauren`) | Pull request | `staging` branch | `git push` via Travis CI Staging Build. (Or manual `git push`.) | `master` branch
**Atlas** | n/a |  Dev Project. (Or single Atlas Project with Dev cluster.) | Dev Project. (Or single Atlas Project with Dev cluster.) | Staging Project. (Or single Atlas Project with Staging cluster.) | Staging Project. (Or single Atlas Project with Staging cluster.) | Prod Project. (Or single Atlas Project with Prod cluster.) | Prod Project. (Or single Atlas Project with Prod cluster.)
**Realm** | n/a |  `git push` triggers deploy to Dev App | Dev App | Merging of pull request triggers deploy to Staging App | Staging App  | Push from successful Staging Build triggers deploy to Prod App. (Or manual `git push` triggers build.) | Prod App
**Travis CI (runs tests—does not deploy)** | n/a | `git push` triggers build  | n/a | Merging of pull request triggers build |  n/a | Push from successful Staging build triggers build. (Or manual `git push` triggers build.) | n/a
**Automated Tests** | Unit | Unit, Integration, & UI run as part of Travis CI build | Unit, Integration, & UI | Unit, Integration, & UI run as part of Travis CI build | Unit, Integration, & UI | Unit run as part of Travis CI build | Unit

### Local

I do my development work locally on my machine.
* **Git**: I have a local copy of my development branch in the Git repo.  The Git repo stores everything in my app including my hosted html files and my serverless functions.
* **Tests**: I can run unit tests that test my serverless functions.  Since I don’t have a way to run Realm locally on my machine, that’s all I can test.  I need to push my code to Realm in order to run manual tests, integration tests, and UI tests.

### Moving from Local to Development

When I'm ready to try out my code, I'm going to move from Local to Development.  

* **How to Move**: I’m going to push changes (`git push`) to my development branch.  
* **Git**: I have a development branch specific to me.  Mine is named `dev-lauren`.  My teammates have their own development branches.
* **Realm and Atlas**: One of the nice things about Realm is that it has a [GitHub auto deploy feature](https://docs.mongodb.com/realm/deploy/deploy-automatically-with-github/) so that whenever I push changes to an associated GitHub repo, the code in that repo is automatically deployed to my Realm app.  That Realm app will be associated with an Atlas project.  The Atlas project is where my database lives.  In my case, I chose to have separate Atlas projects for each stage, so I could take advantage of the free clusters in Atlas.  If you are paying for clusters, you can easily use a single Atlas project for all of your stages.  
* **Travis CI and Tests**: The `git push` is going to trigger a Travis CI build.  The build is responsible for running all of my automated tests.  The build is going to run those tests against the Dev Realm App that was just deployed.  If you have experience with CI/CD infrastructure, this might feel a little odd to you—Travis CI is responsible for running the tests but not for doing the deploy.  So, even if the tests fail, the deploy has already occurred.  This is OK since this is not production—it’s just my dev environment.  

### Development

Every developer has their own Development stage.
* **Git**: My development branch is specific to me.  My teammates have their own development branches.
* **Realm and Atlas**: My code is deployed in my Dev Realm App, which is connected to my Dev Atlas Project.
* **Tests**: I can choose to run manual tests against this deployment.  I can use also my local machine to run automated tests against this deployment.

### Moving from Development to Staging

When I feel like my code is well tested and I’m ready for a teammate to review it, I can move from Development to Staging.

* **How to Move**: I’m going to create a pull request.  Pull requests are a way for me to request that my code be reviewed and considered for merging into the team’s code.
If my pull request is approved, the code changes will be merged into our team's Staging Repo.  
* **Git**: Pull Requests will request to merge code from a development branch to the `staging` branch.
* **Realm and Atlas**:  When my code is merged into the `staging` branch, it will be automatically deployed to my Staging Realm App that is associated with my Staging Atlas Project.
* **Travis CI and Tests**: The merging of my pull request is also going to trigger a Travis CI build.  That build is gong to run all of my automated tests.  If the build passes—meaning that all of my automated tests pass—the build is going to automatically push the code changes to the `master` branch.  I’ll discuss this more below in the section about [Moving from Staging to Prod](#moving-from-staging-to-production).

### Staging

Staging is a place for all of my teammates to merge our code together and see what it will look like in production. 

* **Git**: The `staging` branch stores the code for this stage.
* **Realm and Atlas**: My code is deployed in the Staging Realm App, which is connected to the Staging Atlas Project. 
* **Tests**: This stage is a simulation of Production, so it’s our place to do all of our QA testing.  I can choose to run manual tests against this deployment.  If I want to run the automated tests, I can use my local machine to run the tests against this deployment.

### Moving from Staging to Production

Since we’re following the continuous deployment model, we have a ton of automated tests.  Our team has agreed that we feel confident that, if the tests pass, we are ready to deploy.

* **How to Move**: If the Staging build passes—meaning that all of the tests pass—the Staging build will automatically push the code changes to production.
So instead of having a manual `git push` or a pull request trigger our move to Production, the Staging Build does the `git push` for us.
* **Git**: The code is pushed to the `master` branch.
* **Realm and Atlas**: We still have the GitHub auto deployment feature configured, so the push to the `master` branch is going to trigger a deployment to our Prod Realm App.  That Prod Realm App is associated with a Prod Atlas Project where our prod data is stored.
* **Travis CI and Tests**: The push to the Prod Repo is going to trigger our Prod Build.  The Prod Build only runs the unit tests.  Recall that our integration and UI tests interact with our database, and we don’t want to mess up our Prod database, so we’re only running our unit tests.
In my case, the pipeline stops here.  You may have monitoring or other tools or tests you want to run here.  It all depends on what your team’s requirements are.

### Production

Production is the version of the app that my end users interact with. 

* **Git**: The code is in the `master` branch.
* **Realm and Atlas**: Our app is deployed in the Prod Realm App, and our Prod data is in the associated Prod Atlas Project.
* **Tests**: If we want to run tests, we can use our local machines to execute unit tests against the code in the Prod Repo.

## Automated Deployments

The code is deployed to Realm using [automated GitHub deployments](https://docs.mongodb.com/realm/deploy/deploy-automatically-with-github/). 

## Travis CI Builds

This project uses Travis CI for builds.  You can view the builds at https://travis-ci.com/github/mongodb-developer/SocialStats/branches.

The builds are responsible for running the appropriate automated tests and pushing code to the production GitHub repo.  Note that the builds do NOT actually deploy the app.
See the section above for how the app is deployed.

### Git Tips
Before pushing your changes to your Development Repo, I recommend pulling the latest changes:  `git pull`.

When you want to squash commits in your development branch, rebase against the `staging` branch: 
1. `git pull`
2. `git rebase -i staging`

## Configuring the App

The following steps will walk you through configuring the app for Production, Staging, and Development.

1. **Git**
   1. Fork this repo if you want to create your own version of the app.
   1. Clone this repo or your forked copy as appropriate.
   1. Create a branch for your own development work (for example, `dev-lauren`)

Then, complete the following steps for Prod (`master` branch), Staging (`staging` branch), and Dev (your development branch you created).  Note that you only need to setup Prod and Staging once per team.  Each team member will need to configure their own development branch.

1. **Atlas**
   1. Create a new [MongoDB Atlas](http://bit.ly/MDB_Atlas) project.
   1. Create a cluster (a free cluster is fine if you are not using the app in production).
   1. Create a database user for your tests. The user should have read and write privileges.
   1. Add your current IP address to the IP Access List.
   1. [Create a MongoDB Realm application](https://docs.mongodb.com/realm/procedures/create-realm-app/) in this Atlas project.  Then...
      1. Enable auto deploy.
      1. Enable hosting.
      1. [Load function dependencies](https://docs.mongodb.com/realm/functions/upload-external-dependencies/) for the comma-separated-values npm module.
      1. Review and deploy changes to Realm app.
1. **Charts**
   1. Activate Charts in your Atlas project.
   1. Inside of Charts, add a Data Source for your Atlas cluster.
   1. Create a dashboard.
   1. Add the 4 charts as seen in https://charts.mongodb.com/charts-twitter-stats-vzwpx/public/dashboards/82195382-6cea-4994-9283-cf2fb899c6de 
1. **Travis CI**
   1. Run the [Travis CI to Atlas IP Access Lister](https://github.com/mongodb-developer/Travic-CI-to-Atlas-IP-Access-Lister) so Travis CI can access your database hosted on Atlas.
   1. Add your repo to Travis CI (you only need to do this once for the entire repo).  Hint: you may need to sign out and sign back in to see the repo in your list of repos.
   1. Add the variables described in [Project Variables](#project-variables) to your build's Environment Variables.  Each variable will need to be created for each branch, so make each variable visible only to the appropriate branch.  For example, you will create a `CLUSTER_URI` variable that is only available to the `master` branch, a `CLUSTER_URI` variable that is only available to the `staging` branch, and a `CLUSTER_URI` variable that is only available to your development branch.
   1. Disable `build on pushed pull requests` since Realm will not deploy on PRs. If you left this option enabled, your tests would be running against an old deployment.

After you've completed the steps above for **each** stage (Prod, Stage, and Dev), configure the app:
1. **Configure the App**
   1. Switch to your development branch. 
   1. In your code editor, open [/hosting/files/config.js](/hosting/files/config.js). 
   1. Update the file to reflect the config for your app.
   1. Commit and push the changes.
   1. Move the changes to Staging and then to Prod.

