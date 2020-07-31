/**
 * These tests test the following integrations:
 *   * storeCsvInDb function -> removeBreakingCharacters function
 *   * storeCsvInDb function -> underlying database
 */

const { MongoClient } = require('mongodb');

const { TwitterStatsDb, statsCollection, header, validTweetCsv, validTweetJson, validTweetId, validTweetUpdatedCsv, validTweetUpdatedJson, emojiTweetId, emojiTweetCsv, emojiTweetJson, validTweetKenId, validTweetKenCsv, validTweetKenJson } = require('../constants.js');

const RealmWeb = require('realm-web');

let collection;
let mongoClient;
let app;

beforeAll(async () => {
    // Connect to the Realm app
    app = new RealmWeb.App({ id: `${process.env.STITCH_APP_ID}` });

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
    await app.logIn(RealmWeb.Credentials.anonymous());
    await collection.deleteMany({});
});

test('Single tweet', async () => {

    expect(await app.functions.storeCsvInDb(header + "\n" + validTweetCsv)).toStrictEqual({
        newTweets: [validTweetId],
        tweetsNotInsertedOrUpdated: [],
        updatedTweets: []
    });

    const tweet = await collection.findOne({ _id: validTweetId });
    expect(tweet).toStrictEqual(validTweetJson);
});

test('Emoji tweet', async () => {

    expect(await app.functions.storeCsvInDb(header + "\n" + emojiTweetCsv)).toStrictEqual({
        newTweets: [emojiTweetId],
        tweetsNotInsertedOrUpdated: [],
        updatedTweets: []
    });

    const tweet = await collection.findOne({ _id: emojiTweetId });
    expect(tweet).toStrictEqual(emojiTweetJson);
});

test('Update single tweet', async () => {

    expect(await app.functions.storeCsvInDb(header + "\n" + validTweetCsv)).toStrictEqual({
        newTweets: [validTweetId],
        tweetsNotInsertedOrUpdated: [],
        updatedTweets: []
    });

    let tweet = await collection.findOne({ _id: validTweetId });
    expect(tweet).toStrictEqual(validTweetJson);

    expect(await app.functions.storeCsvInDb(header + "\n" + validTweetUpdatedCsv)).toStrictEqual({
        newTweets: [],
        tweetsNotInsertedOrUpdated: [],
        updatedTweets: [validTweetId]
    });

    tweet = await collection.findOne({ _id: validTweetId });
    expect(tweet).toStrictEqual(validTweetUpdatedJson);

});

test('Store new and updated tweets', async () => {

    // Store validTweet and emojiTweet
    let results = await app.functions.storeCsvInDb(header + "\n" + validTweetCsv + "\n" + emojiTweetCsv);

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
    expect(await app.functions.storeCsvInDb(header + "\n" + validTweetKenCsv + "\n" + validTweetUpdatedCsv)).toStrictEqual({
        newTweets: [validTweetKenId],
        tweetsNotInsertedOrUpdated: [],
        updatedTweets: [validTweetId]
    });

    tweet = await collection.findOne({ _id: validTweetId });
    expect(tweet).toStrictEqual(validTweetUpdatedJson);

    tweet = await collection.findOne({ _id: validTweetKenId });
    expect(tweet).toStrictEqual(validTweetKenJson);

})
