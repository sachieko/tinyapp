const express = require('express');
const methodOverride = require('method-override');
const app = express();
const { PORT, urlLength, uidLength, notUser, invalidUser, loginPlease, pwLength } = require('./constants'); // Each constant is explained in the constants.js file
const cookieSession = require('cookie-session');
const { getUserByEmail, User, Url, updateDatabase, urlsForUser, generateUniqueID } = require('./helpers/helpers'); // Contains helper functions and classes
const bcrypt = require('bcryptjs');


//            //
// Middleware //
//            //
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use('/images', express.static('images'));
app.use(cookieSession({
  name: 'tinyApp',
  keys: ['ImisslivinginJapanbecausethefoodwascheap$$andlike$5adaytoeatout','thefunniestnumbersare6942066677andthecoolestis4']
}));
app.use(methodOverride('_method'));
//
// Create databases from local storage. If this doesn't work, enter into cli: npm run tinyappsetup
const urlDatabase = require('./urlDatabase.json');
const userDatabase = require('./userDatabase.json');

//  - - - - - - - - - - - - - - - - - - -
// Helper functions which require express.
const loginRedirectAsk = function(req, res) {
  res.status(403).render('login', loginPlease); // Renders a template with alert telling user to login to do what they were trying to do.
};

const loginRedirect = function(req, res) {
  res.redirect('/login');
};

const renderInvalidLogin = function(req, res) {
  res.status(403).render('login', invalidUser); // Renders a template with alert telling them the email/pw wasn't valid.
};

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
  loginRedirect(req, res);
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
  renderInvalidLogin(req, res);
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
  if (userExists || email === '' || req.body.password === '' || req.body.password.length > pwLength) { // Catch users trying to use blank or invalid email/passwords
    res.status(400).render('registration', invalidUser);
    return;
  }
  if (!userExists) {
    const uid = generateUniqueID(uidLength, userDatabase);
    userDatabase[uid] = new User(uid, email, passwordHash);
    updateDatabase('userDatabase.json', userDatabase, () => {
      req.session["user_id"] = uid;
      res.redirect('/urls');
    });
    return;
  }
});

//                                    //
// USER PATHS                         //
//                                    //

// POST logout

app.post('/logout', (req, res) => {
  req.session = null;
  loginRedirect(req, res);
});

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
  loginRedirectAsk(req, res);
});

// GET urls/new

app.get('/urls/new', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  if (user) {
    const templateVar = { user };
    res.render('urls_new', templateVar);
    return;
  }
  loginRedirectAsk(req, res);
});

// POST urls

app.post('/urls', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  if (user) {
    const urlID = generateUniqueID(urlLength, urlDatabase);
    urlDatabase[urlID] = new Url(req.body.longURL, user.uid);
    updateDatabase('urlDatabase.json', urlDatabase, () => {
      res.redirect(`/urls/${urlID}`);
    });
    return;
  }
  loginRedirectAsk(req, res);
});

// PUT urls/:id

app.put('/urls/:id', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  const urls = urlsForUser(user.uid, urlDatabase);
  const url = urls[req.params.id];
  if (user && url) { // If user and url is theirs
    url.longURL = req.body.longURL;
    updateDatabase('urlDatabase.json', urlDatabase, () => {
      res.redirect('/urls');
    });
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
  loginRedirectAsk(req, res);
});

// DELETE urls/:id

app.delete('/urls/:id', (req, res) => {
  const user = userDatabase[req.session["user_id"]];
  const urls = urlsForUser(user.uid, urlDatabase);
  const url = urls[req.params.id];
  if (user && url.userID === user.uid) {
    delete urlDatabase[req.params.id];
    updateDatabase('urlDatabase.json', urlDatabase, () => {
      res.redirect('/urls');
    });
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
  loginRedirectAsk(req, res);
});

// GET urls/:id

app.get('/urls/:id', (req, res) => {
  const id = req.params.id;
  const user = userDatabase[req.session["user_id"]];
  const urls = urlsForUser(user.uid, urlDatabase);
  const url = urls[id];
  if (user && url) { // The specific url must be in the users urls.
    const templateVar = {
      id,
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
      meddling: true // Causes a *fun* alert.
    };
    console.log(`User: ${user.email} is meddling`);
    res.status(401).render('urls_index', templateVar);
    return;
  }
  loginRedirectAsk(req, res);
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
  console.log(`TinyApp listening on port ${PORT}!`);
});