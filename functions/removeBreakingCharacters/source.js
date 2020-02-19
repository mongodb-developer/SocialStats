exports = function (csvTweets) {

  // The CSV parser chokes on emoji, so we're pulling out all non-standard characters.
  // Note that this may remove  non-English characters
  csvTweets = csvTweets.replace(/[^a-zA-Z0-9\, "\/\\\n\`~!@#$%^&*()\-_—+=[\]{}|:;\'"<>,.?/']/g, '');

  return csvTweets;
};

if (typeof module !== 'undefined') {
  module.exports = exports;
}
