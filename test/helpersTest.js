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
    password: "thisisahash!"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "thisisahash2!"
  }
};

describe('#getUserByEmail tests', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail(testUsers, "user@example.com");
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });
  it('should return undefined for an invalid email', function() {
    const user = getUserByEmail(testUsers, "hey@someguy.com");
    const expectedUserID = undefined;
    assert.equal(user, expectedUserID);
  });
});

describe('#generateRandomString tests', function() {
  it('should return a random string with length of 6', function() {
    const string = generateRandomString(6);
    assert.equal(string.length, 6);
  });
  it('should return a random string with a length of 15', function() {
    const string = generateRandomString(15);
    assert.equal(string.length, 15);
  });
});