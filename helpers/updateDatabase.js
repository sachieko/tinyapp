const fs = require('fs');
// updateDatabase takes in the path to your json database as a string, the dataObject, a callback, and an optional message.
// The callback is intended for res.redirects or res.renders
// It will console log to your server's console whatever the message is when it is called. Helpful for debugging.
const updateDatabase = function(dbPath, dataObject, callback, message) {
  fs.writeFile(dbPath, JSON.stringify(dataObject), (err) => {
    if (err) {
      throw err;
    }
    if (message) {
      console.log(message);
    }
    callback();
  });
};
module.exports = updateDatabase;