class User {
  constructor(uidString, email, password) {
    this.uid = uidString;
    this.email = email;
    this.password = password;
  }
}
module.exports = User;