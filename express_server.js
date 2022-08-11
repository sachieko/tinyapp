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
// Create database from file
const urlDatabase = JSON.parse(fs.readFileSync('urlDatabase.json'));
const userDatabase = JSON.parse(fs.readFileSync('userDatabase.json'));

//                                    //
// ANYONE CAN ACCESS THE BELOW PATHS  //
//                                    //


// GET login

app.get('/login', (req, res) => {
  const templateVar = { user: undefined }; // Breaks header if missing
  res.render('login', templateVar);
});


// POST login

app.post('/login', (req, res) => {
  const email = req.body.email ? req.body.email : undefined;
  const password = req.body.password;
  const user = findKey(userDatabase, (key) => userDatabase[key].email === email && userDatabase[key].password === password); // both email/Pw must match
  if (user) {
    res.cookie('user_id', user);
    res.redirect('/urls');
    return;
  }
  res.status(403).render('login', { user: undefined }); // Have to use render to post 403 status
});

// GET register

app.get('/register', (req, res) => {
  const templateVar = { user: undefined, userExists: undefined }; // If someone is registering they aren't currently a user, breaks header if missing
  res.render('registration', templateVar);
});

// POST register

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userExists = findKey(userDatabase, (key) =>  userDatabase[key].email === email);
  if (userExists || email === '' || password === '') { // Catch users trying to use blank email or passwords here
    const templateVar = { user: undefined, userExists };
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
  if (userDatabase[req.cookies.user_id]) {
    const templateVar = {
      urls: urlDatabase,
      user: userDatabase[req.cookies.user_id]
    };
    res.render('urls_index', templateVar);
    return;
  }
  res.status(403).render('login', { user: undefined }); // Have to use render to post 403 status
});

// GET urls/new

app.get('/urls/new', (req, res) => {
  const user = userDatabase[req.cookies.user_id];
  if (user) {
    const templateVar = { user: userDatabase[req.cookies.user_id] };
    res.render('urls_new', templateVar);
    return;
  }
  res.status(403).render('login', { user: undefined });
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
  res.status(403).render('login', { user: undefined });
});

// DELETE by using POST urls/id/delete (stuck using POST for now)

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  console.log(`url for ${req.params.id} deleted from database!`);
  fs.writeFile('urlDatabase.json', JSON.stringify(urlDatabase), (err) => {
    if (err) {
      throw err;
    }
    console.log('Database updated (DELETE)');
    res.redirect('/urls');
  });
});

// UPDATE by using POST urls/id/update

app.post('/urls/:id/update', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  console.log(`url for ${req.params.id} update reqested!`);
  fs.writeFile('urlDatabase.json', JSON.stringify(urlDatabase), (err) => {
    if (err) {
      throw err;
    }
    console.log('Database updated (UPDATE)');
    res.redirect('/urls');
  });
});

// GET urls/:id

app.get('/urls/:id', (req, res) => {
  const templateVar = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: userDatabase[req.cookies.user_id]
  };
  res.render('urls_show', templateVar);
});

// GET u/:id in database

app.get('/u/:id', (req, res) => {
  const templateVar = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: userDatabase[req.cookies.user_id]
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
  res.status(418).render('418', { user: undefined }); // Breaks header if missing
});
// Start server to listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});