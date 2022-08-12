const { assert } = require('chai');

const {
  getUserByEmail, // Use: getUserByEmail(databaseObject, emailString) => returns userObject
  generateRandomString, // Use: generateRandomString(number) =>  creates random alphanumeric string of specified length
  User, // Use: new User(uID, email, passwordHash) => creates user obj with { uid: uID, email: email, password: passwordHash }
  Url, // Use: new Url(longURL, userID) => creates url obj with { longURL: longURL, userID: userID, useCount: 0 }
  urlsForUser // Use: urlsForUser(userid, urlData) => returns object with only the urls that match from the urlData object
} = require('../helpers/helpers'); // Contains helper functions and classes

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

const testUrls = {
  "urlRandomString": {
    longURL: "www.test.com",
    userID: "userRandomID",
    useCount: 5
  },
  "url2RandomString": {
    longURL: "www.me2.com",
    userID: "user2RandomID",
    useCount: 0
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

describe('#userClass tests', function() {
  it('should return a new user with the input uid, email, and hash', function() {
    const user = new User('123', 'someguy@email.com', 'hashhere');
    assert.deepEqual(user, { uid: '123', email: 'someguy@email.com', password: 'hashhere' });
  });
});

describe('#urlClass tests', function() {
  it('should return a new Url with the input longUrl, a userid, and useCount: 0.', function() {
    const url = new Url('https://catsaregreat.com', '123');
    assert.deepEqual(url, { longURL: 'https://catsaregreat.com', userID: '123', useCount: 0 });
  });
});

describe('urlsForUser tests', function() {
  it('should return an object of url objects only matching input user', function() {
    const url = urlsForUser('user2RandomID', testUrls);
    assert.deepEqual(url, {
      "url2RandomString":
      { longURL: "www.me2.com",
        userID: "user2RandomID",
        useCount: 0
      }});
  });
});