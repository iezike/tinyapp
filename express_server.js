const express = require("express"); // import express, a framework to simpler server
const bodyParser = require("body-parser"); // imported installed package (middleware) body-parser
const cookieSession = require('cookie-session'); // helps secure cookies
const bcrypt = require('bcryptjs'); // bcryptjs a JS variant of bcrypt use to hash password. 
const { getUserByEmail, urlUserIDMatch, generateRandomString } = require("./helpers"); //import helper functions
const app = express(); // activate the express for use.
const PORT = 8080; // default port value 8080


app.set("view engine", "ejs"); // Setting ejs as the view engine
app.use(bodyParser.urlencoded({extended: true})); // setting app to use bodyParser created.
app.use(cookieSession({
  name: 'session',
  keys: ["Secretkey"],
  maxAge: 24 * 60 * 60 * 1000 
}));

//intialize databases
const users = {};
const urlDatabase = {};

// Helper function to check a user passwords matches with email provided during sign up.
const emailPasswordMatch = function(emailAddress, password) {
  if (!getUserByEmail(emailAddress, users)) {
    return false;
  }
  if (bcrypt.compareSync(password, users[getUserByEmail(emailAddress, users)]["password"])) {
    return true;
  }
  return false;
};


// Main url page
app.get("/urls", (req, res) => {

  const urlFilter = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url]["userID"] === req.session.user_id) {
      urlFilter[url] = urlDatabase[url];
    }
  }
  const templateVars = { urls: urlFilter, user: users[req.session.user_id] };
  res.render("urls_index",  templateVars);

});

// Page for user to create a url
app.get("/urls/new", (req, res) => {

  const templateVars = {  user: users[req.session.user_id] };
  res.render("urls_new", templateVars);

});

// Sign up page
app.get("/register", (req, res) => {

  const templateVars = { user: users[req.session.user_id] };
  res.render("reg_form", templateVars);

});

// login page
app.get("/login", (req, res) => {

  const templateVars = { user: users[req.session.user_id] };
  res.render("login_form", templateVars);

});

// Shows a single shortURL with corresponding longURL
app.get("/urls/:shortURL", (req, res) => {

  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    user: users[req.session.user_id]
  };
  res.render("urls_show", templateVars); // renders templateVars variable to urls_show file
  
});

// Redirect to the longURL, main website.
app.get("/u/:shortURL", (req, res) => {

  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);

});

// Create url page.
app.post("/urls", (req, res) => {
  
  let userNewPage = {};
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const shortURL = generateRandomString();
  userNewPage = { longURL: req.body.longURL, userID: req.session.user_id };
  urlDatabase[shortURL] = userNewPage;
  res.redirect(`/urls/${shortURL}`); //Respond with a redirect to shortURL-longURL pair page

});

// Route to handle edit url
app.post("/urls/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL; // This retrieves the shortURL
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  if (urlUserIDMatch(urlDatabase[shortURL]["longURL"], urlDatabase) !== req.session.user_id) {
    return res.send(" Not authorized to Edit url");
  }
  urlDatabase[shortURL]["longURL"]  = req.body.longURL; //Pair the shortURL with provided new longURL.
  res.redirect(`/urls/${shortURL}`);    // Respond with a redirect to  urls list page

});

// Route to handle a url delete 
app.post("/urls/:shortURL/delete", (req, res) => {

  const shortURL = req.params.shortURL;
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  if (urlUserIDMatch(urlDatabase[shortURL]["longURL"], urlDatabase) !== req.session.user_id) {
    return res.send(" Not authorized to delete url");
  }
  delete urlDatabase[shortURL]; // delete its shortURL-longURL pair from the list
  res.redirect("/urls");   // redirecting to urls list page

});


// Route to handle a user login 
app.post("/login", (req, res) => {

  const currentEmail = req.body.email;
  const currentPassword = req.body.password;
  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Invalid User");
  }
  if (!getUserByEmail(currentEmail, users)) {
    return res.status(403).send("Invalid user, please sign up!");
  }
  if (!emailPasswordMatch(currentEmail, currentPassword)) {
    return res.status(403).send("Email does not match password!");
  }
  req.session.user_id = getUserByEmail(currentEmail, users);
  res.redirect("/urls");  // Respond with a  redirect URL using the generated shortURL-longURL pair

});

// Route to handle a user logout
app.post("/logout", (req, res) => {

  req.session = null;
  res.redirect("/urls"); // Respond with a  redirect URL using the generated shortURL-longURL pair

});


// Route to handle a user registeration form
app.post("/register", (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    return res.status(403).send("Invalid User");
  }
  if (getUserByEmail(req.body.email, users)) {
    return res.status(403).send("Email already exit!");
  }
  const newID = generateRandomString();
  const newUser = { userID: newID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
  users[newID] = newUser;
  req.session.user_id = newID;
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
