const chalk = require('chalk');

const PORT = 8080; // default hosting port is 8080
const urlLength = 4; // Sets minimum length of new urls.
const uidLength = 15; // Sets minimum length of new user ids.
const pwLength = 1000; // Sets maximum password length on registration. Prevents DDOS due to hashing overly lengthy passwords.

// Blank templates for when someone is not signed in.
const notUser = { user: undefined, invalidEntry: undefined }; // Used to prevent header from breaking since _header.ejs uses user object
const invalidUser = { user: undefined, invalidEntry: 0 }; // Used to display alert on invalid registrations
const loginPlease = { user: undefined, invalidEntry: 1 }; // Used to display alert for triyng GET urls without logging in.

// These messages will log to your server console whenever the action occurs so you can debug and see activity.
const updateUrlMsg = chalk.green('URL Database updated! (POST)');
const updateUsersMsg = chalk.blue('User Database updated! (POST)');
const deleteUrlMsg = chalk.red('URL Database updated! (DELETE)');

module.exports = { PORT, urlLength, uidLength, notUser, invalidUser, loginPlease, updateUrlMsg, updateUsersMsg, deleteUrlMsg, pwLength };