const findKey = function(object, cb) {
  for (const key in object) {
    if (cb(key)) {
      return key;
    }
  }
  return undefined;
};
module.exports = findKey;