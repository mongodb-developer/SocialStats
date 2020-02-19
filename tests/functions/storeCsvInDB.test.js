const storeCsvInDb = require('../../functions/storeCsvInDb/source.js');

// TODO: refactor these to use constants.js
const header = `"Tweet id","Tweet permalink","Tweet text","time","impressions","engagements","engagement rate","retweets","replies","likes","user profile clicks","url clicks","hashtag clicks","detail expands","permalink clicks","app opens","app installs","follows","email tweet","dial phone","media views","media engagements","promoted impressions","promoted engagements","promoted engagement rate","promoted retweets","promoted replies","promoted likes","promoted user profile clicks","promoted url clicks","promoted hashtag clicks","promoted detail expands","promoted permalink clicks","promoted app opens","promoted app installs","promoted follows","promoted email tweet","promoted dial phone","promoted media views","promoted media engagements"`;
const validTweet = `"1226928883355791360","https://twitter.com/Lauren_Schaefer/status/1226928883355791360","Simple tweet","2020-02-10 18:00 +0000","1203.0","39.0","0.032418952618453865","4.0","0.0","7.0","2.0","22.0","0.0","4.0","0.0","0","0","0","0","0","0","0","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"`;
const validTweet2 = `"1226928883355791361","https://twitter.com/Lauren_Schaefer/status/1226928883355791361","Another tweet from me <3","2020-02-11 18:00 +0000","1203.0","39.0","0.032418952618453865","4.0","0.0","7.0","2.0","22.0","0.0","4.0","0.0","0","0","0","0","0","0","0","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"`;
const validTweetKen = `"1226928883355791362","https://twitter.com/kenwalger/status/1226928883355791362","I like to make bad dad jokes","2020-02-12 18:00 +0000","1203.0","39.0","0.032418952618453865","4.0","0.0","7.0","2.0","22.0","0.0","4.0","0.0","0","0","0","0","0","0","0","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"`;

beforeEach(() => {
    // TODO: Sanity check this with someone else
    // Mock functions to support context.services.get().db().collection().updateOne()
    updateOne = jest.fn(() => {
        return result = {
            upsertedId: "1226928883355791360"
        }
    });
    collection = jest.fn(() => { return { updateOne } });
    db = jest.fn(() => { return { collection }; });
    get = jest.fn(() => { return { db } });

    collection.updateOne = updateOne;
    db.collection = collection;
    get.db = db;

    // Mock the removeBreakingCharacters function to return whatever is passed to it
    // Setup global.context.services
    global.context = {
        functions: {
            execute: jest.fn((functionName, csvTweets) => { return csvTweets; })
        },
        services: {
            get
        }
    }
});


test('Single tweet', async () => {

    const csvTweets = header + "\n" + validTweet;

    expect(await storeCsvInDb(csvTweets)).toStrictEqual({
        newTweets: ["1226928883355791360"],
        tweetsNotInsertedOrUpdated: [],
        updatedTweets: []
    });

    expect(context.functions.execute).toHaveBeenCalledWith("removeBreakingCharacters", csvTweets);
    expect(context.services.get.db.collection.updateOne).toHaveBeenCalledWith(
        { _id: "1226928883355791360" },
        {
            $set: {
                "Tweet permalink": "https://twitter.com/Lauren_Schaefer/status/1226928883355791360",
                "Tweet text": "Simple tweet",
                "_id": "1226928883355791360",
                "app installs": 0,
                "app opens": 0,
                "author": "Lauren_Schaefer",
                "date": new Date("2020-02-10 00:00 +0000"),
                "detail expands": 4,
                "dial phone": 0,
                "email tweet": 0,
                "engagement rate": 0.032418952618453865,
                "engagements": 39,
                "follows": 0,
                "hashtag clicks": 0,
                "impressions": 1203,
                "likes": 7,
                "media engagements": 0,
                "media views": 0,
                "permalink clicks": 0,
                "promoted app installs": "-",
                "promoted app opens": "-",
                "promoted detail expands": "-",
                "promoted dial phone": "-",
                "promoted email tweet": "-",
                "promoted engagement rate": "-",
                "promoted engagements": "-",
                "promoted follows": "-",
                "promoted hashtag clicks": "-",
                "promoted impressions": "-",
                "promoted likes": "-",
                "promoted media engagements": "-",
                "promoted media views": "-",
                "promoted permalink clicks": "-",
                "promoted replies": "-",
                "promoted retweets": "-",
                "promoted url clicks": "-",
                "promoted user profile clicks": "-",
                "replies": 0,
                "retweets": 4,
                "time": "2020-02-10 18:00 +0000",
                "url clicks": 22,
                "user profile clicks": 2
            }
        },
        { upsert: true });
})

test('Multiple tweets', async () => {

    updateOne.mockReturnValueOnce(result = {
        modifiedCount: 1
    })

    updateOne.mockReturnValueOnce(result = {
        upsertedId: "1226928883355791361",
        modifiedCount: 0
    })

    updateOne.mockReturnValueOnce(result = {
        upsertedCount: 0,
        modifiedCount: 0
    })

    const csvTweets = header + "\n" + validTweet + "\n" + validTweet2 + "\n" + validTweetKen;

    expect(await storeCsvInDb(csvTweets)).toStrictEqual({
        newTweets: ["1226928883355791361"],
        tweetsNotInsertedOrUpdated: ["1226928883355791362"],
        updatedTweets: ["1226928883355791360"]
    });
    expect(context.functions.execute).toHaveBeenCalledWith("removeBreakingCharacters", csvTweets);
    expect(context.services.get.db.collection.updateOne).toHaveBeenNthCalledWith(1,
        { _id: "1226928883355791360" },
        {
            $set: {
                "Tweet permalink": "https://twitter.com/Lauren_Schaefer/status/1226928883355791360",
                "Tweet text": "Simple tweet",
                "_id": "1226928883355791360",
                "app installs": 0,
                "app opens": 0,
                "author": "Lauren_Schaefer",
                "date": new Date("2020-02-10 00:00 +0000"),
                "detail expands": 4,
                "dial phone": 0,
                "email tweet": 0,
                "engagement rate": 0.032418952618453865,
                "engagements": 39,
                "follows": 0,
                "hashtag clicks": 0,
                "impressions": 1203,
                "likes": 7,
                "media engagements": 0,
                "media views": 0,
                "permalink clicks": 0,
                "promoted app installs": "-",
                "promoted app opens": "-",
                "promoted detail expands": "-",
                "promoted dial phone": "-",
                "promoted email tweet": "-",
                "promoted engagement rate": "-",
                "promoted engagements": "-",
                "promoted follows": "-",
                "promoted hashtag clicks": "-",
                "promoted impressions": "-",
                "promoted likes": "-",
                "promoted media engagements": "-",
                "promoted media views": "-",
                "promoted permalink clicks": "-",
                "promoted replies": "-",
                "promoted retweets": "-",
                "promoted url clicks": "-",
                "promoted user profile clicks": "-",
                "replies": 0,
                "retweets": 4,
                "time": "2020-02-10 18:00 +0000",
                "url clicks": 22,
                "user profile clicks": 2
            }
        },
        { upsert: true });

    expect(context.services.get.db.collection.updateOne).toHaveBeenNthCalledWith(2,
        { _id: "1226928883355791361" },
        {
            $set: {
                "Tweet permalink": "https://twitter.com/Lauren_Schaefer/status/1226928883355791361",
                "Tweet text": "Another tweet from me <3",
                "_id": "1226928883355791361",
                "app installs": 0,
                "app opens": 0,
                "author": "Lauren_Schaefer",
                "date": new Date("2020-02-11 00:00 +0000"),
                "detail expands": 4,
                "dial phone": 0,
                "email tweet": 0,
                "engagement rate": 0.032418952618453865,
                "engagements": 39,
                "follows": 0,
                "hashtag clicks": 0,
                "impressions": 1203,
                "likes": 7,
                "media engagements": 0,
                "media views": 0,
                "permalink clicks": 0,
                "promoted app installs": "-",
                "promoted app opens": "-",
                "promoted detail expands": "-",
                "promoted dial phone": "-",
                "promoted email tweet": "-",
                "promoted engagement rate": "-",
                "promoted engagements": "-",
                "promoted follows": "-",
                "promoted hashtag clicks": "-",
                "promoted impressions": "-",
                "promoted likes": "-",
                "promoted media engagements": "-",
                "promoted media views": "-",
                "promoted permalink clicks": "-",
                "promoted replies": "-",
                "promoted retweets": "-",
                "promoted url clicks": "-",
                "promoted user profile clicks": "-",
                "replies": 0,
                "retweets": 4,
                "time": "2020-02-11 18:00 +0000",
                "url clicks": 22,
                "user profile clicks": 2
            }
        },
        { upsert: true });

    expect(context.services.get.db.collection.updateOne).toHaveBeenNthCalledWith(3,
        { _id: "1226928883355791362" },
        {
            $set: {
                "Tweet permalink": "https://twitter.com/kenwalger/status/1226928883355791362",
                "Tweet text": "I like to make bad dad jokes",
                "_id": "1226928883355791362",
                "app installs": 0,
                "app opens": 0,
                "author": "kenwalger",
                "date": new Date("2020-02-12 00:00 +0000"),
                "detail expands": 4,
                "dial phone": 0,
                "email tweet": 0,
                "engagement rate": 0.032418952618453865,
                "engagements": 39,
                "follows": 0,
                "hashtag clicks": 0,
                "impressions": 1203,
                "likes": 7,
                "media engagements": 0,
                "media views": 0,
                "permalink clicks": 0,
                "promoted app installs": "-",
                "promoted app opens": "-",
                "promoted detail expands": "-",
                "promoted dial phone": "-",
                "promoted email tweet": "-",
                "promoted engagement rate": "-",
                "promoted engagements": "-",
                "promoted follows": "-",
                "promoted hashtag clicks": "-",
                "promoted impressions": "-",
                "promoted likes": "-",
                "promoted media engagements": "-",
                "promoted media views": "-",
                "promoted permalink clicks": "-",
                "promoted replies": "-",
                "promoted retweets": "-",
                "promoted url clicks": "-",
                "promoted user profile clicks": "-",
                "replies": 0,
                "retweets": 4,
                "time": "2020-02-12 18:00 +0000",
                "url clicks": 22,
                "user profile clicks": 2
            }
        },
        { upsert: true });
})
