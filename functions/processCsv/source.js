exports = function (encodedData) {

  // TODO: handle if the data isn't in the format we expect
  // Remove the front part of the data (for example: "data:text/csv;base64,SGkgTGF1cmVu")
  encodedData = encodedData.substring(21);

  const myBuffer = new Buffer(encodedData, 'base64')

  const decodedData = myBuffer.toString();

  return context.functions.execute("storeCsvInDb", decodedData);
};

if (typeof module !== 'undefined') {
  module.exports = exports;
}