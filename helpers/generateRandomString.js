const generateRandomString = function(length) { // length is a number choosing length of the random string. I use 6 for URLs, 15 for uids.
  let string = '';
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charLength = characters.length;
  for (let i = 0; i < length; i++) {
    string += characters.charAt(Math.floor(Math.random() * charLength));
  }
  return string;
};

module.exports = generateRandomString;