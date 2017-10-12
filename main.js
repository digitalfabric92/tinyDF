// ================================================================================
// Initialization and Require
// ================================================================================

'use_strict;'
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// View engine
app.set("view engine", "ejs")

// ================================================================================
// Database and objects
// ================================================================================

//const userDatabase = require('./mock-data').users;
//const urlDatabase = require('./mock-data').urls;

// Database of short URL keys and the long URLS
let urlDatabase = {
    "b2xVn2": {long: "http://www.lighthouselabs.ca", userID: "dave" },
    "9sm5xK": {long: "http://www.google.com", userID: "dave"}
};

// Users object
let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "dave": {
    id: "dave",
    email: "dwawryko@gmail.com",
    password: "123456"
  }
};

// ================================================================================
// Get requests
// ================================================================================

// Hello page
app.get("/", (req, res) => {
  res.end("Hello!");
});

// Sending urlDatabase data within the urls key
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user_id: req.cookies['user_id']
  };
  res.render("urls_index", templateVars);
});

// form urls_new to create/add new shortened URLs
app.get('/urls/new', (req, res)=>{
  let user_id = req.cookies['user_id'];
  let templateVars = {
    user: users[user_id],
  };
  if (user_id){
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

// Returns registration page
app.get("/register", (req, res) => {
  let templateVars = {
    users: users,
    user_id: req.cookies['user_id']
  };
  res.render('register', templateVars);
});

// Create a Login Page
app.get('/login', (req, res)=>{
  res.render('login' /*templateVars*/);
});

app.get("/u/:shortURL", (req, res) => {
  let templateVars =  {
    users: users,
    user_id: req.cookies['user_id']
  };
  let longURL = urlDatabase[req.params.shortURL];
  if (longURL) {
    res.redirect(longURL, templateVars);
  } else {
    res.send('Not Found!');
  }
});

app.get('/urls/:id', (req, res)=>{
  let templateVars =  {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    //users: users,
    user_id: req.cookies['user_id']
  };
  res.render('urls_show', templateVars);
});

// ================================================================================
// Unused get requests
// ================================================================================

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// // app.get("/hello", (req, res) => {
//     res.end("<html><body>Hello <b>World</b></body></html>\n");
// });

// ================================================================================
// Post Requests
// ================================================================================

// Register new user object in the global users
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
      var user_id = generateRandomString();
      var email = req.body.email;
      var password = req.body.password;
      res.cookie('user_id', user_id);
      users[user_id] = { id:user_id, email:email, password:password};
      res.redirect('/urls');
  } else {
    res.status(400).send('Please provide email and password');
  }
});

// Login post request
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let auth;
  for (var KEY in users) {
    if (users[KEY].email === email && users[KEY].password === password) {
      res.cookie('user_id', users[KEY].id);
      res.redirect('/urls');
      auth = true;
    };
  };
  if (!auth) {
    res.status(403).send('User with that email not found.');
  }
});

// Logout post request (logout handler)
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// Post route that shortens URL
app.post('/urls', (req, res) => {
    var shortURL = generateRandomString();
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect(302, '/urls/'+shortURL);
});

// Post route that updates a URL resource
app.post('/urls/:id', (req, res)=>{
  var updatedURL = req.body.updatedURL;
  var shortURL = req.params.id;
  // check if :id is in the database
  urlDatabase[shortURL] = updatedURL;
  res.redirect('/urls/'+shortURL);
});

//Post route that removes a URL resource:
app.post('/urls/:id/delete', (req, res)=>{
    var deletedURL = req.params.id;
    delete urlDatabase[deletedURL];
    res.redirect('/urls');
});

// ================================================================================
// Server listen
// ================================================================================

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
});

// ================================================================================
// Functions
// ================================================================================

// Generate alphanumeric string
function generateRandomString() {
  let NUM ='';
  let CDS = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let length = 6;
  for (var i = 0; i < length; i++){
    NUM += CDS.charAt(Math.floor(Math.random() * (CDS.length + 1) ));
  }
  let POS = Math.floor(Math.random() * length)+1;
  let result = NUM.substr(0, POS) + "DF" + NUM.substr(POS);
  return result;
}

// Returns subset of URL database that belongs to users email
function urlsForUser(id){

}

// 1. Only registered users can shorten URLs X
// 2. URLs belong to users
// 3. Users can only edit or delete their own URLs
// 4. Users can only see their own shortened URLs
// 5. Anyone can visit short URLs



