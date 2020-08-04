const removeBreakingCharacters = require('../../../functions/removeBreakingCharacters/source.js');

const { header, validTweetCsv, emojiTweetCsv, emojiTweetCsvClean, specialCharactersTweetCsv } = require('../../constants.js');

test('SingleValidTweet', () => {
    const csv = header + "\n" + validTweetCsv;
    expect(removeBreakingCharacters(csv)).toBe(csv);
})

test('EmojiTweet', () => {
    const csvBefore = header + "\n" + emojiTweetCsv;
    const csvAfter = header + "\n" + emojiTweetCsvClean;
    expect(removeBreakingCharacters(csvBefore)).toBe(csvAfter);
})

test('ValidSpecialCharacters', () => {
    const csv = header + "\n" + specialCharactersTweetCsv;
    expect(removeBreakingCharacters(csv)).toBe(csv);
})

test('LotsOfTweets', () => {
    const csvBefore = header + "\n" + validTweetCsv + "\n" + emojiTweetCsv + "\n" + specialCharactersTweetCsv
    const csvAfter = header + "\n" + validTweetCsv + "\n" + emojiTweetCsvClean + "\n" + specialCharactersTweetCsv
    expect(removeBreakingCharacters(csvBefore)).toBe(csvAfter);
})
