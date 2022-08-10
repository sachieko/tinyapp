class User {
  constructor(uidString, name, email, password) {
    this.uid = uidString;
    this.username = name;
    this.email = email;
    this.password = password;
  }
}
module.exports = User;