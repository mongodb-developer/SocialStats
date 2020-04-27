const { MongoClient } = require('mongodb');

const { Builder, By, until, Capabilities } = require('selenium-webdriver');

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

   // Create a new driver using headless Chrome
   let chromeCapabilities = Capabilities.chrome();
   var chromeOptions = {
      'args': ['--headless', 'window-size=1920,1080']
   };
   chromeCapabilities.set('chromeOptions', chromeOptions);
   driver = new Builder()
      .forBrowser('chrome')
      .usingServer('http://localhost:4444/wd/hub')
      .withCapabilities(chromeCapabilities)
      .build();
});

afterEach(async () => {
   driver.close();
})

afterAll(async () => {
   await mongoClient.close();
})

test('Single tweet', async () => {
   await driver.get(`${process.env.URL}`);
   const button = await driver.findElement(By.id('csvUpload'));
   await button.sendKeys(process.cwd() + "/tests/ui/files/singletweet.csv");

   const results = await driver.findElement(By.id('results'));
   await driver.wait(until.elementTextIs(results, `Success! 1 new Tweet(s) was/were saved.`), 10000);

   const dashboardLink = await driver.findElement(By.id('dashboard-link'));
   dashboardLink.click();

   // Hacking this a bit since we can't access the numbers in the chart itself.
   // Instead we'll hover over the chart and pull the values out of the tooltip.

   await driver.wait(until.elementLocated(By.xpath("//*[text()='Total Engagements']")));
   const totalEngagements = await driver.findElement(By.xpath("//*[text()='Total Engagements']/parent::*//canvas"));

   await driver.wait(until.elementLocated(By.xpath("//*[text()='Total Impressions']")));
   const totalImpressions = await driver.findElement(By.xpath("//*[text()='Total Impressions']/parent::*//canvas"));

   const actions = driver.actions();
   await actions.move({ origin: totalEngagements }).perform();
   await driver.wait(until.elementLocated(By.xpath("//*[@id='vg-tooltip-element']//*[text()='4']")));

   await actions.move({ origin: totalImpressions }).perform();
   await driver.wait(until.elementLocated(By.xpath("//*[@id='vg-tooltip-element']//*[text()='260']")));
})

test('New, updates, and multiple authors', async () => {
   await driver.get(`${process.env.URL}`);

   const button = await driver.findElement(By.id('csvUpload'));
   await button.sendKeys(process.cwd() + "/tests/ui/files/twotweets.csv");

   const results = await driver.findElement(By.id('results'));
   await driver.wait(until.elementTextIs(results, `Success! 2 new Tweet(s) was/were saved.`), 10000);

   await button.sendKeys(process.cwd() + "/tests/ui/files/twotweets_updated.csv");
   await driver.wait(until.elementTextIs(results, `Success! 3 new Tweet(s) was/were saved. 2 Tweet(s) was/were updated.`), 10000);

   const dashboardLink = await driver.findElement(By.id('dashboard-link'));
   dashboardLink.click();

   // Hacking this a bit since we can't access the numbers in the chart itself.
   // Instead we'll hover over the chart and pull the values out of the tooltip.


   //TODO: store these xpaths as consts in the file to reduce duplication
   await driver.wait(until.elementLocated(By.xpath("//*[text()='Total Engagements']")));
   const totalEngagements = await driver.findElement(By.xpath("//*[text()='Total Engagements']/parent::*//canvas"));

   await driver.wait(until.elementLocated(By.xpath("//*[text()='Total Impressions']")));
   const totalImpressions = await driver.findElement(By.xpath("//*[text()='Total Impressions']/parent::*//canvas"));

   const actions = driver.actions();
   await actions.move({ origin: totalEngagements }).perform();
   await driver.wait(until.elementLocated(By.xpath("//*[@id='vg-tooltip-element']//*[text()='23']")));

   await actions.move({ origin: totalImpressions }).perform();
   await driver.wait(until.elementLocated(By.xpath("//*[@id='vg-tooltip-element']//*[text()='1,323']")));
})
