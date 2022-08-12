class Url {
  constructor(longURL, userid) {
    this.longURL = longURL;
    this.userID = userid;
    this.useCount = 0;
  }
}
module.exports = Url;