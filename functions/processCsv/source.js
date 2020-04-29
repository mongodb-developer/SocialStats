exports = function (encodedData) {
  var d = new Date();
  console.log("Entering processCsv at " + d);

  // TODO: handle if the data isn't in the format we expect
  // Remove the front part of the data (for example: "data:text/csv;base64,SGkgTGF1cmVu")
  encodedData = encodedData.substring(21);

  const myBuffer = new Buffer(encodedData, 'base64')

  const decodedData = myBuffer.toString();

  var d2 = new Date();
  var difference = d2.getTime() - d.getTime();
  console.log("Exiting processCsv at " + d2 + ". Total time: " + difference);

  return context.functions.execute("storeCsvInDb", decodedData);
};

if (typeof module !== 'undefined') {
  module.exports = exports;
}