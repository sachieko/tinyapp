const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const generateRandomString = function() {
  let string = '';
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const charLength = characters.length;
  // This sets how long all newly generated strings will be for urls. Change if you want longer/shorter
  const length = 6;
  for (let i = 0; i < length; i++) {
    string += characters.charAt(Math.floor(Math.random() * charLength));
  }
  return string;
};

//
// Middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev')); // Dev middleware for debugging
app.use('/images', express.static('images'));
app.use(cookieParser());

//
// Create database from file
const urlDatabase = JSON.parse(fs.readFileSync('urlDatabase.json'));

//
// GET urls
app.get('/urls', (req, res) => {
  const templateVar = {
    urls: urlDatabase,
    username: req.cookies.username
  };
  res.render('urls_index', templateVar);
});
//
// GET urls/new
app.get('/urls/new', (req, res) => {
  const templateVar = { username: req.cookies.username };
  res.render('urls_new', templateVar);
});
//
// POST login
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});
//
// POST logout
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});
//
// POST urls
app.post('/urls', (req, res) => {
  let randomString = generateRandomString();
  urlDatabase[randomString] = req.body.longURL;

  fs.writeFile('urlDatabase.json', JSON.stringify(urlDatabase), (err) => {
    if (err) {
      throw err;
    }
    console.log("Database updated");
    res.redirect(`/urls/${randomString}`);
  });
});
//
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
//
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
//
// GET urls/:id
app.get('/urls/:id', (req, res) => {
  const templateVar = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username
  };
  res.render('urls_show', templateVar);
});
//
// GET u/:id in database
app.get('/u/:id', (req, res) => {
  const templateVar = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies.username
  };
  urlDatabase[templateVar.id] ? res.redirect(templateVar.longURL) : res.redirect('/418');
});

//
// GET catchall
app.get('*', (req, res) => {
  res.status(418).render('418');
});
// Start server to listen
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});