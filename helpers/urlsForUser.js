const urlsForUser = function(userid, urlData) {
  let result = {};
  for (let url in urlData) {
    if (urlData[url].userID === userid) {
      result[url] = urlData[url];
    }
  }
  return result;
};
module.exports = urlsForUser;