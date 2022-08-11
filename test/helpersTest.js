const { assert } = require('chai');

const {
  getUserByEmail, // Use: getUserByEmail(databaseObject, emailString) => returns userObject
  generateRandomString, // Use: generateRandomString(number) =>  creates random alphanumeric string of specified length
  User, // Use: new User(uID, email, passwordHash) => creates user obj with { uid: uID, email: email, password: passwordHash }
  Url, // Use: new Url(longURL, userID) => creates url obj with { longURL: longURL, userID: userID, useCount: 0 }
  updateDatabase, // Params: (dbPath, dataObject, callback, message) async writes dataObject to JSON file at dbPath before doing callback
  urlsForUser // Use: urlsForUser(userid, urlData) => returns object with only the urls that match from the urlData object
} = require('../helpers'); // Contains helper functions and classes

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};
