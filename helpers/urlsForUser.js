const urlsForUser = function(userid, dataObject) {
  let result = {};
  for (let url in dataObject) {
    if (dataObject[url].userID === userid) {
      result[url] = dataObject[url];
    }
  }
  return result;
};
module.exports = urlsForUser;