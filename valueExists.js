const valueExists = function(object, cb) {
  for (const key in object) {
    if (cb(key)) {
      return true;
    }
  }
  return false;
};
module.exports = valueExists;