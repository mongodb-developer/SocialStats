const storeCsvInDb = require('../../../functions/storeCsvInDb/source.js');

const { header, validTweetCsv, validTweetJson, validTweetId, validTweet2Csv, validTweet2Id, validTweet2Json, validTweetKenId, validTweetKenCsv, validTweetKenJson } = require('../../constants.js');

let updateOne;

beforeEach(() => {
    // Mock functions to support context.services.get().db().collection().updateOne()
    updateOne = jest.fn(() => {
        return result = {
            upsertedId: validTweetId
        }
    });

    const collection = jest.fn().mockReturnValue({ updateOne });
    const db = jest.fn().mockReturnValue({ collection });
    const get = jest.fn().mockReturnValue({ db });

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

    const csvTweets = header + "\n" + validTweetCsv;

    expect(await storeCsvInDb(csvTweets)).toStrictEqual({
        newTweets: [validTweetId],
        tweetsNotInsertedOrUpdated: [],
        updatedTweets: []
    });

    expect(context.functions.execute).toHaveBeenCalledWith("removeBreakingCharacters", csvTweets);
    expect(context.services.get.db.collection.updateOne).toHaveBeenCalledWith(
        { _id: validTweetId },
        {
            $set: validTweetJson
        },
        { upsert: true });
})

test('Multiple tweets', async () => {

    updateOne.mockReturnValueOnce(result = {
        modifiedCount: 1
    })

    updateOne.mockReturnValueOnce(result = {
        upsertedId: validTweet2Id,
        modifiedCount: 0
    })

    updateOne.mockReturnValueOnce(result = {
        upsertedCount: 0,
        modifiedCount: 0
    })

    const csvTweets = header + "\n" + validTweetCsv + "\n" + validTweet2Csv + "\n" + validTweetKenCsv;

    expect(await storeCsvInDb(csvTweets)).toStrictEqual({
        newTweets: [validTweet2Id],
        tweetsNotInsertedOrUpdated: [validTweetKenId],
        updatedTweets: [validTweetId]
    });
    expect(context.functions.execute).toHaveBeenCalledWith("removeBreakingCharacters", csvTweets);
    expect(context.services.get.db.collection.updateOne).toHaveBeenNthCalledWith(1,
        { _id: validTweetId },
        {
            $set: validTweetJson
        },
        { upsert: true });

    expect(context.services.get.db.collection.updateOne).toHaveBeenNthCalledWith(2,
        { _id: validTweet2Id },
        {
            $set: validTweet2Json
        },
        { upsert: true });

    expect(context.services.get.db.collection.updateOne).toHaveBeenNthCalledWith(3,
        { _id: validTweetKenId },
        {
            $set: validTweetKenJson
        },
        { upsert: true });
})

test('Single tweet with exception', async () => {

    updateOne.mockImplementation(() => {
        throw new Error();
    });

    const csvTweets = header + "\n" + validTweetCsv;

    expect(await storeCsvInDb(csvTweets)).toStrictEqual({
        newTweets: [],
        tweetsNotInsertedOrUpdated: [validTweetId],
        updatedTweets: []
    });

    expect(context.functions.execute).toHaveBeenCalledWith("removeBreakingCharacters", csvTweets);
    expect(context.services.get.db.collection.updateOne).toHaveBeenCalledWith(
        { _id: validTweetId },
        {
            $set: validTweetJson
        },
        { upsert: true });
})

