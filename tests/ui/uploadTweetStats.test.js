const { MongoClient } = require('mongodb');

const { Builder, By, until, Capabilities } = require('selenium-webdriver');

const { TwitterStatsDb, statsCollection } = require('../constants.js');

let collection;
let mongoClient;
let driver;

const totalEngagementsXpath = "//*[text()='Total Engagements']";
const totalImpressionsXpath = "//*[text()='Total Impressions']";

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
   await driver.wait(until.elementTextIs(results, `Fabulous! 1 new Tweet(s) was/were saved.`), 10000);

   const dashboardLink = await driver.findElement(By.id('dashboard-link'));
   dashboardLink.click();

   // Hacking this a bit since we can't access the numbers in the chart itself.
   // Instead we'll hover over the chart and pull the values out of the tooltip.

   await moveToCanvasOfElement(totalEngagementsXpath);
   await driver.wait(until.elementLocated(By.xpath("//*[@id='vg-tooltip-element']//*[text()='4']")));

   await moveToCanvasOfElement(totalImpressionsXpath);
   await driver.wait(until.elementLocated(By.xpath("//*[@id='vg-tooltip-element']//*[text()='260']")));
})

test('New, updates, and multiple authors', async () => {
   await driver.get(`${process.env.URL}`);

   const button = await driver.findElement(By.id('csvUpload'));
   await button.sendKeys(process.cwd() + "/tests/ui/files/twotweets.csv");

   const results = await driver.findElement(By.id('results'));
   await driver.wait(until.elementTextIs(results, `Fabulous! 2 new Tweet(s) was/were saved.`), 10000);

   await button.sendKeys(process.cwd() + "/tests/ui/files/twotweets_updated.csv");
   await driver.wait(until.elementTextIs(results, `Fabulous! 3 new Tweet(s) was/were saved. 2 Tweet(s) was/were updated.`), 10000);

   const dashboardLink = await driver.findElement(By.id('dashboard-link'));
   dashboardLink.click();

   // Hacking this a bit since we can't access the numbers in the chart itself.
   // Instead we'll hover over the chart and pull the values out of the tooltip.

   await moveToCanvasOfElement(totalEngagementsXpath);
   await driver.wait(until.elementLocated(By.xpath("//*[@id='vg-tooltip-element']//*[text()='23']")));

   await moveToCanvasOfElement(totalImpressionsXpath);
   await driver.wait(until.elementLocated(By.xpath("//*[@id='vg-tooltip-element']//*[text()='1,323']")));
})

async function moveToCanvasOfElement(elementXPath) {
   let i = 0;
   // Getting sporadic StaleElementReferenceErrors as the elements briefly disappear after loading
   // so we'll try 5 times in order to get around the sporadic failures
   while (i < 5) {
      try {
         await driver.wait(until.elementLocated(By.xpath(elementXPath)));
         const canvas = await driver.findElement(By.xpath(elementXPath + "/parent::*//canvas"));
         const actions = driver.actions();
         await actions.move({ origin: canvas }).perform();
         break;
      } catch (e) {
         if (i == 4) {
            throw e;
         }
      }
      i++;
   }
}
