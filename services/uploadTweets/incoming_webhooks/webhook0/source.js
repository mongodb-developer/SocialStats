// This function is the webhook's request handler.
exports = function (payload, response) {

  // console.log("inside the webhook: " + JSON.stringify(payload));
  // console.log(JSON.stringify(payload.body));
  // console.log(JSON.stringify(payload.headers));
  // console.log(JSON.stringify(payload.headers["Content-Type"]));
  // console.log(JSON.stringify(payload.query));

  // Retrieve the csv tweet data from the request
  const multipart = require('parse-multipart');

  const contentTypes = payload.headers["Content-Type"];

  const body = new Buffer(payload.body.text(), 'utf-8');

  var boundary = multipart.getBoundary(JSON.stringify(contentTypes));
  // trim the extra junk off the end of the boundary
  boundary = boundary.substring(0, boundary.length - 2);

  const parts = multipart.Parse(body, boundary);

  //TODO: check the file is really a csv

  // TODO: limit this to one file
  // For each file that was passed, store the data in the database   
  for (var i = 0; i < parts.length; i++) {
    var part = parts[i];
    return context.functions.execute("storeCsvInDb", part.data.toString('utf-8'));
  }

  //TODO: Return invalid response if no file is uploaded
  return "No files were uploaded";
};

if (typeof module !== 'undefined') {
  module.exports = exports;
}
