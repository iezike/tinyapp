const express = require("express"); // import express, a framework to simpler server
const bodyParser = require("body-parser"); // imported installed package (middleware) body-parser
const cookieSession = require('cookie-session') // helps secure cookies
const bcrypt = require('bcryptjs'); // bcryptjs a JS variant of bcrypt use to hash password.
const app = express(); // activate the express for use.
const PORT = 8080; // default port value 8080

const { getUserByEmail, urlUserIDMatch, generateRandomString } = require("./helpers")

// Helper function to check a user passwords matches with the previous
const emailPasswordMatch = function(emailAddress, password) {
  if (!getUserByEmail(emailAddress, users)) {
    return false;
  }
  if( bcrypt.compareSync(password, users[getUserByEmail(emailAddress,users)]["password"])) {
    return true;
  }
  return false;
};


const users = {};
const urlDatabase = {};

app.use(cookieSession({
  name: 'session',
  keys: ["Secretkey"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set("view engine", "ejs"); // Setting ejs as the view engine
app.use(bodyParser.urlencoded({extended: true})); // setting app to use bodyParser created.


//renders to urls_index
app.get("/urls", (req, res) => {
  const urlFilter = {};
  for ( let url in urlDatabase) {
    if (urlDatabase[url]["userID"] === req.session.user_id) {
      urlFilter[url] = urlDatabase[url];
    }
  }
  const templateVars = { urls: urlFilter, user: users[req.session.user_id] };
  res.render("urls_index",  templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {  user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("reg_form", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("login_form", templateVars);
});

// Shows a single shortURL with corresponding longURL 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars); // renders templateVars variable to urls_show file
});

// Get request for redirect to the longURL, main website.
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"]
  res.redirect(longURL);
});

// Create url.
app.post("/urls", (req, res) => {
  let userNewPage = {};
  if (!req.session.user_id){
    return res.redirect("/login");
  } 
  const shortURL = generateRandomString()
  userNewPage = { longURL: req.body.longURL, userID: req.session.user_id }
  urlDatabase[shortURL] = userNewPage;
  res.redirect(`/urls/${shortURL}`); // Respond with a  redirect URL using the generated shortURL-longURL pair
});

// Createn a route to handle edit url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; // This retrieves the shortURL
  if (!req.session.user_id){
    return res.redirect("/login");
  }
  if (!urlUserIDMatch(urlDatabase[shortURL]["longURL"], req.session.user_id)) {
    return res.send(" Not authorized to Edit url");
  }
  urlDatabase[shortURL]["longURL"]  = req.body.longURL; // pair the new shortURL with provided (Edited) longURL.
  res.redirect(`/urls/${shortURL}`);      // Respond with a redirect to  urls list page
});

// Creat a route to handle delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL; 
  if (!req.session.user_id){
    return res.redirect("/login");
  }
  if (!urlUserIDMatch(urlDatabase[shortURL]["longURL"], req.session.user_id)) {
    return res.send(" Not authorized to delete url")
  }
  delete urlDatabase[shortURL]; // delete its shortURL-longURL pair from the list
  res.redirect("/urls");   // redirecting to urls list page
});


// Create a login route
app.post("/login", (req, res) => {
  const currentEmail = req.body.email;
  const currentPassword = req.body.password; 
  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Invalid User");
  }
  if(!getUserByEmail(currentEmail, users)) {
    return res.status(403).send("Invalid User");
  }
  if (!emailPasswordMatch(currentEmail, currentPassword)){
    return res.status(403).send("email does not match password");
  }
  req.session.user_id = getUserByEmail(currentEmail, users);
  // res.cookie("user_id", checkRegUser(currentEmail)); 
  res.redirect("/urls");       // Respond with a  redirect URL using the generated shortURL-longURL pair
});

// Create logout route
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");       // Respond with a  redirect URL using the generated shortURL-longURL pair
});


// Create a route to handle registeration form
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Invalid User");
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(403).send("Email already exit");
  }
  const newID = generateRandomString();
  const newUser = { userID: newID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
  users[newID] = newUser;
  req.session.user_id = newID
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
