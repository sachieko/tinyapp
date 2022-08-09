const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');
const fs = require('fs');

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

//
// Create database from file
const urlDatabase = JSON.parse(fs.readFileSync('urlDatabase.json'));

//
// GET /
app.get('/', (req, res) => {
  res.send("Hello!");
});
//
// GET hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>Waarudo</b></body></html>\n');
});
//
// GET urls
app.get('/urls', (req, res) => {
  const templateVar = { urls: urlDatabase };
  res.render('urls_index', templateVar);
});
//
// GET urls/new
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
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
// POST urls/id/delete
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  console.log(`url for ${req.params.id} deleted from database!`);
  fs.writeFile('urlDatabase.json', JSON.stringify(urlDatabase), (err) => {
    if (err) {
      throw err;
    }
    console.log('Database updated');
    res.redirect('/urls');
  });
});
//
// GET urls/:id
app.get('/urls/:id', (req, res) => {
  const templateVar = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVar);
});
//
// GET u/:id in database
app.get('/u/:id', (req, res) => {
  const templateVar = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  urlDatabase[templateVar.id] ? res.redirect(templateVar.longURL) : res.redirect('/418');
});
//
// GET urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
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