const getUserByEmail = require('./getUserByEmail'); // Use: getUserByEmail(databaseObject, emailString) => returns userObject
const generateRandomString = require('./generateRandomString'); // Use: generateRandomString(number) =>  creates random alphanumeric string of specified length
const User = require('./userClass'); // Use: new User(uID, email, passwordHash) => creates user obj with { uid: uID, email: email, password: passwordHash }
const Url = require('./urlClass'); // Use: new Url(longURL, userID) => creates url obj with { longURL: longURL, userID: userID, useCount: 0 }
const updateDatabase = require('./updateDatabase'); // Params: (dbPath, dataObject, callback, message) async writes dataObject to JSON file at dbPath before doing callback. Message is optional to console log for debugging
const urlsForUser = require("./urlsForUser"); // Use: urlsForUser(userid, urlData) => returns object with only the urls that match from the urlData object
const generateUniqueID = require('./generateUniqueID'); // Use: generateUniqueID(minimumLength, databaseToBeUniqueIn);
module.exports = { getUserByEmail, generateRandomString, User, Url, updateDatabase, urlsForUser, generateUniqueID };