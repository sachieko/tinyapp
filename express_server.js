const express = require('express');
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan'); // debugging on server
const cookieSession = require('cookie-session');
const { getUserByEmail, generateRandomString, User, Url, updateDatabase, urlsForUser } = require('./helpers'); // Contains helper functions and classes
const bcrypt = require('bcryptjs');

//            //
// Middleware //
//            //
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Dev middleware for debugging
app.use('/images', express.static('images'));
app.use(cookieSession({
  name: 'tinyApp',
  keys: ['ImisslivinginJapanbecausethefoodwascheap$$andlike$5adaytoeatout','thefunniestnumbersare6942066677andthecoolestis4']
}));

//
// Create databases from local storage.
const urlDatabase = require('./urlDatabase.json');
const userDatabase = require('./userDatabase.json');
const urlLength = 4; // Sets minimum length of new urls
const uidLength = 15; // Sets minimum length of new user ids

// Blank templates for when someone is not signed in.
const notUser = { user: undefined, invalidEntry: undefined }; // Used to prevent header from breaking since _header.ejs uses user object
const invalidUser = { user: undefined, invalidEntry: 0 }; // Used to display alert on invalid registrations
const loginPlease = { user: undefined, invalidEntry: 1 }; // Used to display alert for triyng GET urls without logging in.

//                                    //
// NON-USERS PATHS BELOW              //
//                                    //


// GET login

app.get('/', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  if (user) {
    res.redirect('/urls');
    return;
  }
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  if (user) {
    res.redirect('/urls');
    return;
  }
  res.render('login', notUser); // Header requires an object
});


// POST login

app.post('/login', (req, res) => {
  const email = req.body.email ? req.body.email : undefined;
  // both email/Pw must match to return user
  const user = getUserByEmail(userDatabase, email);
  if (user && bcrypt.compareSync(req.body.password, userDatabase[user].password)) {
    req.session["user_id"] = user;
    res.redirect('/urls');
    return;
  }
  res.status(403).render('login', invalidUser); // Have to use render to send 403 status
});

// GET register

app.get('/register', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  if (user) {
    res.redirect('/urls');
    return;
  }
  res.render('registration', notUser);
});

// POST register

app.post('/register', (req, res) => {
  const email = req.body.email;
  const passwordHash = bcrypt.hashSync(req.body.password, 10);
  const userExists = getUserByEmail(userDatabase, email);
  if (userExists || email === '' || req.body.password === '') { // Catch users trying to use blank email/password or previous emails
    res.status(400).render('registration', invalidUser);
    return;
  }
  if (!userExists) {
    let uid = generateRandomString(uidLength);
    while (userDatabase[uid]) { // Prevents duplicate user ids
      uid += generateRandomString(1);
    }
    userDatabase[uid] = new User(uid, email, passwordHash);
    updateDatabase('userDatabase.json', userDatabase, () => {
      req.session["user_id"] = uid;
      res.redirect('/urls');
    }, "Updated User Database (POST new user)");
    return;
  }
});

//                                    //
// USER PATHS                         //
//                                    //

// GET urls

app.get('/urls', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  if (user) {
    const urls = urlsForUser(user.uid, urlDatabase);
    const templateVar = {
      urls,
      user
    };
    res.render('urls_index', templateVar);
    return;
  }
  res.status(403).render('login', loginPlease); // Have to use render to send 403 status
});

// GET urls/new

app.get('/urls/new', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  if (user) {
    const templateVar = { user };
    res.render('urls_new', templateVar);
    return;
  }
  res.status(403).render('login', loginPlease);
});


// POST logout

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// POST urls

app.post('/urls', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  if (user) {
    let randomString = generateRandomString(urlLength);
    while (urlDatabase[randomString]) { // Prevents duplicate urls
      randomString += generateRandomString(1);
    }
    urlDatabase[randomString] = new Url(req.body.longURL, user.uid);
    updateDatabase('urlDatabase.json', urlDatabase, () => {
      res.redirect(`/urls/${randomString}`);
    }, "URL Database updated (POST new URL)");
    return;
  }
  res.status(403).render('login', loginPlease);
});

// UPDATE by using POST urls/id/update

app.post('/urls/:id/update', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  const urls = urlsForUser(user.uid, urlDatabase);
  const url = urls[req.params.id];
  if (user && url) { // If user and url is theirs
    url.longURL = req.body.longURL;
    url.useCount = 0; // reset;
    console.log(`url for ${req.params.id} update reqested!`);
    updateDatabase('urlDatabase.json', urlDatabase, () => {
      res.redirect('/urls');
    }, 'URL Database updated (POST URL)');
    return;
  }
  if (user && !url) {
    const templateVar = {
      urls,
      user,
      meddling: true
    };
    console.log(`User: ${user.email} is meddling`);
    res.status(401).render('urls_index', templateVar);
    return;
  }
  res.status(403).render('login', loginPlease);
});
// DELETE by using POST urls/id/delete (stuck using POST for now)

app.post('/urls/:id/delete', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  const urls = urlsForUser(user.uid, urlDatabase);
  const url = urls[req.params.id];
  if (user && url.userID === user.uid) {
    delete urlDatabase[req.params.id];
    console.log(`url for ${req.params.id} deleted from database!`);
    updateDatabase('urlDatabase.json', urlDatabase, () => {
      res.redirect('/urls');
    }, "URL Database POST (DELETE URL)");
    return;
  }
  if (user && url.userID !== user.uid) {
    const templateVar = {
      urls,
      user,
      meddling: true
    };
    console.log(`User: ${user.email} is meddling`);
    res.status(401).render('urls_index', templateVar);
    return;
  }
  res.status(403).render('login', loginPlease);
});

// GET urls/:id

app.get('/urls/:id', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  const urls = urlsForUser(user.uid, urlDatabase);
  const url = urls[req.params.id];
  if (user && url) { // The specific url must be in the users urls.
    const templateVar = {
      id: req.params.id,
      url,
      user
    };
    res.render('urls_show', templateVar);
    return;
  }
  if (user && !url) { // If they're a user but it's not a url owned by them they're meddlers.
    const templateVar = {
      urls,
      user,
      meddling: true
    };
    console.log(`User: ${user.email} is meddling`);
    res.status(401).render('urls_index', templateVar);
    return;
  }
  res.status(403).render('login', loginPlease);
});

//                                 //
// Non-specific Userless endpoints //
//                                 //

// GET u/id - Redirect anyone with link elsewhere, so that users can share these links with friends/followers.
// redirects anyone with link to users desired destination.

app.get('/u/:id', (req, res) => {
  const url = urlDatabase[req.params.id];
  if (url) {
    url.useCount += 1;
    res.redirect(url.longURL);
    updateDatabase('urlDatabase.json', urlDatabase, () => {});
    return;
  }
  res.redirect('/418');
});

//                                    //
// Renders server a teapot for any    //
// other requests.                    //

// GET catchall

app.get('*', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  if (user) { // just incase a user is logged in for the 418 page :)
    const templateVar = { user };
    res.status(418).render('418', templateVar);
    return;
  }
  res.status(418).render('418', notUser); // Breaks header if missing
});

// Start server to listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});