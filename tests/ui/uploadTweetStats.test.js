const { MongoClient } = require('mongodb');

const { Builder, By, Key, until } = require('selenium-webdriver');

const { TwitterStatsDb, statsCollection } = require('../constants.js');

let collection;
let mongoClient;
let driver;

beforeAll(async () => {

   jest.setTimeout(30000);

   // Connect directly to the database
   const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.CLUSTER_URI}/test?retryWrites=true&w=majority`;
   mongoClient = new MongoClient(uri);
   await mongoClient.connect();
   collection = mongoClient.db(TwitterStatsDb).collection(statsCollection);
});

beforeEach(async () => {
   // Clear the database
   await collection.deleteMany({});

   driver = new Builder()
      .forBrowser('chrome')
      .usingServer('http://localhost:4444/wd/hub')
      .build();
});

afterEach(async () => {
   driver.quit()
})

afterAll(async () => {
   await mongoClient.close();
})

test('Single tweet', async () => {

   await driver.get(`${process.env.URL}/upload.html`);
   const button = await driver.findElement(By.id('csvUpload'));
   await button.sendKeys("/Users/lauren/Documents/git/SocialStats/tests/ui/files/singletweet.csv");

   const results = await driver.findElement(By.id('results'));
   await driver.wait(until.elementTextIs(results, `Success! 1 new Tweet(s) was/were saved.`), 10000);

})

test('New, updates, and multiple authors', async () => {
   await driver.get(`${process.env.URL}/upload.html`);

   const button = await driver.findElement(By.id('csvUpload'));
   await button.sendKeys("/Users/lauren/Documents/git/SocialStats/tests/ui/files/twotweets.csv");

   const results = await driver.findElement(By.id('results'));
   await driver.wait(until.elementTextIs(results, `Success! 2 new Tweet(s) was/were saved.`), 10000);

   await button.sendKeys("/Users/lauren/Documents/git/SocialStats/tests/ui/files/twotweets_updated.csv");
   await driver.wait(until.elementTextIs(results, `Success! 3 new Tweet(s) was/were saved. 2 Tweet(s) was/were updated.`), 10000);

})



