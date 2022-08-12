const getUserByEmail = function(database, email) {
  for (const key in database) {
    if (database[key].email === email) {
      return key;
    }
  }
  return undefined;
};
module.exports = getUserByEmail;