const getUserByEmail = require('./getUserByEmail');
const generateRandomString = require('./generateRandomString');
const User = require('./user'); // Used to register new users
const Url = require('./urlClass'); // Used to register new URLs
const updateDatabase = require('./updateDatabase'); // Used to update database json files.
const urlsForUser = require("./urlsForUser"); // Filters object to only have keys meeting a string input

module.exports = { getUserByEmail, generateRandomString, User, Url, updateDatabase, urlsForUser };