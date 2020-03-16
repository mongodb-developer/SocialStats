/**
 * These tests test the following integrations:
 *   * storeCsvInDb function -> storeCsvInDb function -> underlying db
 */

const { MongoClient } = require('mongodb');

const { TwitterStatsDb, statsCollection, header, validTweetCsv, validTweetJson, validTweetId, validTweetUpdatedCsv, validTweetUpdatedJson, emojiTweetId, emojiTweetCsv, emojiTweetJson, validTweetKenId, validTweetKenCsv, validTweetKenJson } = require('../constants.js');

const {
    Stitch,
    AnonymousCredential
} = require('mongodb-stitch-browser-sdk');

let collection;
let mongoClient;
let stitchClient

beforeAll(async () => {
    jest.setTimeout(10000);

    // Connect to the Stitch app
    stitchClient = Stitch.initializeDefaultAppClient(`${process.env.STITCH_APP_ID}`);

    // Connect directly to the database
    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.CLUSTER_URI}/test?retryWrites=true&w=majority`;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    collection = mongoClient.db(TwitterStatsDb).collection(statsCollection);
});

afterAll(async () => {
    await mongoClient.close();
})

beforeEach(async () => {
    await stitchClient.auth.loginWithCredential(new AnonymousCredential());
    await collection.deleteMany({});
});


test('Single tweet', async () => {
    const data = "data:text/csv;base64," + Buffer.from(header + "\n" + validTweetCsv).toString('base64');

    expect(await stitchClient.callFunction("processCsv", [data])).toStrictEqual({
        newTweets: [validTweetId],
        tweetsNotInsertedOrUpdated: [],
        updatedTweets: []
    });

    const tweet = await collection.findOne({ _id: validTweetId });
    expect(tweet).toStrictEqual(validTweetJson);
});

test('Update single tweet', async () => {

    const data = "data:text/csv;base64," + Buffer.from(header + "\n" + validTweetCsv).toString('base64');

    expect(await stitchClient.callFunction("processCsv", [data])).toEqual({
        newTweets: [validTweetId],
        tweetsNotInsertedOrUpdated: [],
        updatedTweets: []
    });

    let tweet = await collection.findOne({ _id: validTweetId });
    expect(tweet).toStrictEqual(validTweetJson);

    const updatedData = "data:text/csv;base64," + Buffer.from(header + "\n" + validTweetUpdatedCsv).toString('base64');

    expect(await stitchClient.callFunction("processCsv", [updatedData])).toEqual({
        newTweets: [],
        tweetsNotInsertedOrUpdated: [],
        updatedTweets: [validTweetId]
    });

    tweet = await collection.findOne({ _id: validTweetId });
    expect(tweet).toStrictEqual(validTweetUpdatedJson);

});

test('Store new and updated tweets', async () => {

    const data = "data:text/csv;base64," + Buffer.from(header + "\n" + validTweetCsv + "\n" + emojiTweetCsv).toString('base64');

    // Store validTweet and emojiTweet
    let results = await stitchClient.callFunction("processCsv", [data]);

    // Sort the results to avoid test failures due to the order of the Tweets in the array
    results.newTweets = results.newTweets.sort();

    let expectedResults = {
        newTweets: [validTweetId, emojiTweetId].sort(),
        tweetsNotInsertedOrUpdated: [],
        updatedTweets: []
    }

    expect(results).toEqual(expectedResults);

    let tweet = await collection.findOne({ _id: validTweetId });
    expect(tweet).toStrictEqual(validTweetJson);

    tweet = await collection.findOne({ _id: emojiTweetId });
    expect(tweet).toStrictEqual(emojiTweetJson);

    // Store validTweetKen and updatedValidTweet

    const updatedData = "data:text/csv;base64," + Buffer.from(header + "\n" + validTweetKenCsv + "\n" + validTweetUpdatedCsv).toString('base64');

    expect(await stitchClient.callFunction("processCsv", [updatedData])).toEqual({
        newTweets: [validTweetKenId],
        tweetsNotInsertedOrUpdated: [],
        updatedTweets: [validTweetId]
    });

    tweet = await collection.findOne({ _id: validTweetId });
    expect(tweet).toStrictEqual(validTweetUpdatedJson);

    tweet = await collection.findOne({ _id: validTweetKenId });
    expect(tweet).toStrictEqual(validTweetKenJson);

})
