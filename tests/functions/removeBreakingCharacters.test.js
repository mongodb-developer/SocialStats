const removeBreakingCharacters = require('../../functions/removeBreakingCharacters/source.js');

const header = `"Tweet id","Tweet permalink","Tweet text","time","impressions","engagements","engagement rate","retweets","replies","likes","user profile clicks","url clicks","hashtag clicks","detail expands","permalink clicks","app opens","app installs","follows","email tweet","dial phone","media views","media engagements","promoted impressions","promoted engagements","promoted engagement rate","promoted retweets","promoted replies","promoted likes","promoted user profile clicks","promoted url clicks","promoted hashtag clicks","promoted detail expands","promoted permalink clicks","promoted app opens","promoted app installs","promoted follows","promoted email tweet","promoted dial phone","promoted media views","promoted media engagements"`;
const validTweet = `"1226928883355791360","https://twitter.com/Lauren_Schaefer/status/1226928883355791360","Simple tweet","2020-02-10 18:00 +0000","1203.0","39.0","0.032418952618453865","4.0","0.0","7.0","2.0","22.0","0.0","4.0","0.0","0","0","0","0","0","0","0","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"`;
const emojiTweet = `"1226928883355791361","https://twitter.com/Lauren_Schaefer/status/1226928883355791361","Emoji tweet 😀💅👸","2020-02-11 18:00 +0000","1203.0","39.0","0.032418952618453865","4.0","0.0","7.0","2.0","22.0","0.0","4.0","0.0","0","0","0","0","0","0","0","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"`;
const emojiTweetClean = `"1226928883355791361","https://twitter.com/Lauren_Schaefer/status/1226928883355791361","Emoji tweet ","2020-02-11 18:00 +0000","1203.0","39.0","0.032418952618453865","4.0","0.0","7.0","2.0","22.0","0.0","4.0","0.0","0","0","0","0","0","0","0","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"`;
const specialCharactersTweet = `"1226928883355791362","https://twitter.com/Lauren_Schaefer/status/1226928883355791362","Lots of special characters 0123456789 !@#$%^&*()-_=+[]{}\\|;:'",./<>? \`~","2020-02-12 18:00 +0000","1203.0","39.0","0.032418952618453865","4.0","0.0","7.0","2.0","22.0","0.0","4.0","0.0","0","0","0","0","0","0","0","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-","-"`;


test('SingleValidTweet', () => {
    const csv = header + "\n" + validTweet;
    expect(removeBreakingCharacters(csv)).toBe(csv);
})

test('EmojiTweet', () => {
    const csvBefore = header + "\n" + emojiTweet;
    const csvAfter = header + "\n" + emojiTweetClean;
    expect(removeBreakingCharacters(csvBefore)).toBe(csvAfter);
})

test('ValidSpecialCharacters', () => {
    const csv = header + "\n" + specialCharactersTweet;
    expect(removeBreakingCharacters(csv)).toBe(csv);
})

test('LotsOfTweets', () => {
    const csvBefore = header + "\n" + validTweet + "\n" + emojiTweet + "\n" + specialCharactersTweet
    const csvAfter = header + "\n" + validTweet + "\n" + emojiTweetClean + "\n" + specialCharactersTweet
    expect(removeBreakingCharacters(csvBefore)).toBe(csvAfter);
})
