const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan'); // debugging on server
const cookieParser = require('cookie-parser');
const User = require('./user'); // Used to register new users
const Url = require('./urlClass.js'); // Used to register new URLs
const generateRandomString = require('./generateRandomString');
const findKey = require('./findKey'); // find key via findKey(object, callback)
const updateDatabase = require("./updateDatabase"); // Used to update database json files.

//            //
// Middleware //
//            //
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Dev middleware for debugging
app.use('/images', express.static('images'));
app.use(cookieParser());

//
// Create databases from local storage.
const urlDatabase = require('./urlDatabase.json');
const userDatabase = require('./userDatabase.json');
const urlLength = 4; // Sets minimum length of new urls
const uidLength = 15; // Sets minimum length of new user ids

// Blank templates for when someone is not signed in.
const notUser = { user: undefined, invalidEntry: undefined }; // Used to prevent header from breaking since _header.ejs uses user object
const invalidUser = { user: undefined, invalidEntry: true }; // Used to display alert on invalid registrations

//                                    //
// NON-USERS PATHS BELOW              //
//                                    //


// GET login

app.get('/login', (req, res) => {
  const user = userDatabase[req.cookies.user_id];
  if (user) {
    res.redirect('/urls');
    return;
  }
  const templateVar = notUser; // Breaks header if missing
  res.render('login', templateVar);
});


// POST login

app.post('/login', (req, res) => {
  const email = req.body.email ? req.body.email : undefined;
  const password = req.body.password;
  const user = findKey(userDatabase, (key) => userDatabase[key].email === email && userDatabase[key].password === password); // both email/Pw must match to return user
  if (user) {
    res.cookie('user_id', user);
    res.redirect('/urls');
    return;
  }
  res.status(403).render('login', invalidUser); // Have to use render to send 403 status
});

// GET register

app.get('/register', (req, res) => {
  const user = userDatabase[req.cookies.user_id]; // If someone is registering they aren't currently a user, breaks header if missing
  if (user) {
    res.redirect('/urls');
    return;
  }
  res.render('registration', notUser);
});

// POST register

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userExists = findKey(userDatabase, (key) =>  userDatabase[key].email === email);
  if (userExists || email === '' || password === '') { // Catch users trying to use blank email or passwords here
    res.status(400).render('registration', invalidUser);
    return;
  }
  if (!userExists) {
    let uid = generateRandomString(uidLength);
    while (userDatabase[uid]) { // Prevents duplicate user ids
      uid += generateRandomString(1);
    }
    userDatabase[uid] = new User(uid, email, password);
    updateDatabase('userDatabase.json', userDatabase, () => {
      res.cookie('user_id', uid);
      res.redirect('/urls');
    }, "Updated User Database (POST new user)");
    return;
  }
});

//                                    //
// USER PATHS BELOW                   //
//                                    //

// GET urls

app.get('/urls', (req, res) => {
  const user = userDatabase[req.cookies.user_id];
  if (user) {
    const templateVar = {
      urls: urlDatabase,
      user
    };
    res.render('urls_index', templateVar);
    return;
  }
  res.status(403).render('login', notUser); // Have to use render to send 403 status
});

// GET urls/new

app.get('/urls/new', (req, res) => {
  const user = userDatabase[req.cookies.user_id];
  if (user) {
    const templateVar = { user };
    res.render('urls_new', templateVar);
    return;
  }
  res.status(403).render('login', notUser);
});


// POST logout

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// POST urls

app.post('/urls', (req, res) => {
  const user = userDatabase[req.cookies.user_id];
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
  res.status(403).render('login', notUser);
});

// DELETE by using POST urls/id/delete (stuck using POST for now)

app.post('/urls/:id/delete', (req, res) => {
  const user = userDatabase[req.cookies.user_id];
  if (user) {
    delete urlDatabase[req.params.id];
    console.log(`url for ${req.params.id} deleted from database!`);
    updateDatabase('urlDatabase.json', urlDatabase, () => {
      res.redirect('/urls');
    }, "URL Database POST (DELETE URL)");
    return;
  }
  res.status(403).render('login', notUser);
});

// UPDATE by using POST urls/id/update

app.post('/urls/:id/update', (req, res) => {
  const user = userDatabase[req.cookies.user_id];
  if (user) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    console.log(`url for ${req.params.id} update reqested!`);
    updateDatabase('urlDatabase.json', urlDatabase, () => {
      res.redirect('/urls');
    }, 'URL Database updated (POST URL)');
    return;
  }
  res.status(403).render('login', notUser);
});

// GET urls/:id

app.get('/urls/:id', (req, res) => {
  const user = userDatabase[req.cookies.user_id];
  if (user) {
    const templateVar = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      user
    };
    res.render('urls_show', templateVar);
    return;
  }
  res.status(403).render('login', notUser);
});

//                                 //
// Non-specific Userless endpoints //
//                                 //

// GET u/id - Redirect anyone with link elsewhere, so that users can share these links with friends/followers.
// redirects anyone with link to users desired destination.

app.get('/u/:id', (req, res) => {
  const templateVar = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
  };
  urlDatabase[templateVar.id] ? res.redirect(templateVar.longURL) : res.redirect('/418');
});

//                                    //
// Renders server a teapot for any    //
// other requests.                    //

// GET catchall

app.get('*', (req, res) => {
  const user = userDatabase[req.cookies.user_id];
  if (user) { // just incase a user wants to be logged in for the 418 page :)
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