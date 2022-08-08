const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

// middleware
app.set('view engine', 'ejs');


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

// GET urls/:id
app.get('/urls/:id', (req, res) => {
  const templateVar = { id: req.params.id, longURL: urlDatabase[req.params.id]};
  res.render('urls_show', templateVar);
});
// GET urls.json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});