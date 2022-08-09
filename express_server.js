const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const morgan = require('morgan');

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

// middleware
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(morgan(':method :url :status'));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "b4k4m1": "http://www.example.com"
};
// GET /
app.get('/', (req, res) => {
  res.send("Hello!");
});
// GET hello
app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>Waarudo</b></body></html>\n');
});

// GET urls
app.get('/urls', (req, res) => {
  const templateVar = { urls: urlDatabase };
  res.render('urls_index', templateVar);
});
// POST urls
app.post('/urls', (req, res) => {
  console.log(req.body);
  let randomString = generateRandomString();
  res.send(`New url posted to: /${randomString}`);
});

// GET urls/new
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// GET urls/:id
app.get('/urls/:id', (req, res) => {
  const templateVar = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVar);
});
// GET urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// GET catchall
app.get('*', (req, res) => {
  res.status(418).render('418');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});