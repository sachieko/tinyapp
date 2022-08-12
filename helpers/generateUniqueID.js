const generateRandomString = require('./generateRandomString');
const generateUniqueID = function(minLength, databaseToBeUniqueIn) {
  let uid = generateRandomString(minLength);
  while (databaseToBeUniqueIn[uid]) { // Prevents duplicate user ids
    uid += generateRandomString(1);
  }
  return uid;
};
module.exports = generateUniqueID;