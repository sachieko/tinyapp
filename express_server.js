const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan'); // debugging on server
const fs = require('fs'); // Used to create json files for database
const cookieParser = require('cookie-parser');
const User = require('./user'); // Used to register new users
const generateRandomString = require('./generateRandomString');
const findKey = require('./findKey'); // find key via findKey(object, callback)

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
const urlDatabase = JSON.parse(fs.readFileSync('urlDatabase.json'));
const userDatabase = JSON.parse(fs.readFileSync('userDatabase.json'));

const notUser = { user: undefined, userExists: true }; // Used to prevent header from breaking since _header.ejs uses user object

//                                    //
// NON-USERS CAN ACCESS THESE PATHS   //
//                                    //


// GET login

app.get('/login', (req, res) => {
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
  res.status(403).render('login', notUser); // Have to use render to post 403 status
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
    const templateVar = notUser;
    res.status(400).render('registration', templateVar);
    return;
  }
  if (!userExists) {
    const uid = generateRandomString(15); // uid should be long to be more 'secure', I chose 15 chars
    userDatabase[uid] = new User(uid, email, password);
    fs.writeFile('userDatabase.json', JSON.stringify(userDatabase), (err) => {
      if (err) {
        throw err;
      }
      console.log('User Database updated!');
      res.cookie('user_id', uid);
      res.redirect('/urls');
      return;
    });
  }
});

//                                    //
// USER MUST BE VALIDATED FOR THESE   //
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
  res.status(403).render('login', notUser); // Have to use render to post 403 status
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
    let randomString = generateRandomString(6); // new Urls are short.
    urlDatabase[randomString] = req.body.longURL;
    fs.writeFile('urlDatabase.json', JSON.stringify(urlDatabase), (err) => {
      if (err) {
        throw err;
      }
      console.log("URL Database updated");
      res.redirect(`/urls/${randomString}`);
    });
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
    fs.writeFile('urlDatabase.json', JSON.stringify(urlDatabase), (err) => {
      if (err) {
        throw err;
      }
      console.log('Database updated (DELETE)');
      res.redirect('/urls');
    });
    return;
  }
  res.status(403).render('login', notUser);
});

// UPDATE by using POST urls/id/update

app.post('/urls/:id/update', (req, res) => {
  const user = userDatabase[req.cookies.user_id];
  if (user) {
    urlDatabase[req.params.id] = req.body.longURL;
    console.log(`url for ${req.params.id} update reqested!`);
    fs.writeFile('urlDatabase.json', JSON.stringify(urlDatabase), (err) => {
      if (err) {
        throw err;
      }
      console.log('Database updated (UPDATE)');
      res.redirect('/urls');
    });
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
      longURL: urlDatabase[req.params.id],
      user: userDatabase[req.cookies.user_id]
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
    longURL: urlDatabase[req.params.id],
  };
  urlDatabase[templateVar.id] ? res.redirect(templateVar.longURL) : res.redirect('/418');
});

//                                    //
// Renders server a teapot for any    //
// other requests.                    //

// GET catchall

app.get('*', (req, res) => {
  if (userDatabase[req.cookies.user_id]) {
    const templateVar = { user: userDatabase[req.cookies.user_id] };
    res.status(418).render('418', templateVar);
  }
  res.status(418).render('418', notUser); // Breaks header if missing
});
// Start server to listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});