exports = async function (csvTweets) {

  const CSV = require("comma-separated-values");

  // The CSV parser chokes on emoji, so we're pulling out all non-standard characters.
  // Note that this may remove non-English characters
  csvTweets = context.functions.execute("removeBreakingCharacters", csvTweets);

  // Convert the CSV Tweets to JSON Tweets
  jsonTweets = new CSV(csvTweets, { header: true }).parse();

  // Store the results
  var results = {
    newTweets: [],
    updatedTweets: [],
    tweetsNotInsertedOrUpdated: []
  }

  jsonTweets.forEach(async (tweet) => {

    // TODO: double check if this is true
    // The conversion from CSV to JSON is resulting in the Tweet ID being rounded, so we'll manually pull it out of the Tweet link
    delete tweet["Tweet id"];

    // Pull the author and Tweet id out of the Tweet permalink
    // TODO: check that the author matches the user who is signed in to prevent sabotage 
    const link = tweet["Tweet permalink"];
    const pattern = /https?:\/\/twitter.com\/([^\/]+)\/status\/(.*)/i;
    const regexResults = pattern.exec(link);
    tweet.author = regexResults[1];
    tweet._id = regexResults[2]

    // Generate a date from the time string
    tweet.date = new Date(tweet.time.substring(0, 10));

    // Upsert the Tweet, so we can update stats for existing Tweets
    const result = await context.services.get("mongodb-atlas").db("TwitterStats").collection("stats").updateOne(
      { _id: tweet._id },
      { $set: tweet },
      { upsert: true });

    if (result.upsertedId) {
      results.newTweets.push(tweet._id);
    } else if (result.modifiedCount > 0) {
      results.updatedTweets.push(tweet._id);
    } else {
      results.tweetsNotInsertedOrUpdated.push(tweet._id);
    }

  });

  //TODO: add error handling
  return results;
};

if (typeof module !== 'undefined') {
  module.exports = exports;
}
