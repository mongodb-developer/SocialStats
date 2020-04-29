exports = function (csvTweets) {
  var d = new Date();
  console.log("Entering removeBreakingCharacters at " + d);
  // The CSV parser chokes on emoji, so we're pulling out all non-standard characters.
  // Note that this may remove  non-English characters
  csvTweets = csvTweets.replace(/[^a-zA-Z0-9\, "\/\\\n\`~!@#$%^&*()\-_—+=[\]{}|:;\'"<>,.?/']/g, '');

  var d2 = new Date();
  var difference = d2.getTime() - d.getTime();
  console.log("Exiting removeBreakingCharacters at " + d2 + ". Total time: " + difference);

  return csvTweets;
};

if (typeof module !== 'undefined') {
  module.exports = exports;
}
