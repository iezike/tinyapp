const express = require("express"); // import express, a framework to simpler server
const app = express(); // activate the express for use.
const PORT = 8080; // default port value 8080
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.set("view engine", "ejs"); // Setting ejs as the view engine
const bodyParser = require("body-parser"); // imported installed package (middleware) body-parser
app.use(bodyParser.urlencoded({extended: true})); // setting app to use bodyParser created.

const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8); // generates a random alphanumeric string of length six.
};

// Create an object to store long URL(main site), with shortURL keys
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Create storage for Registered users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Playaround with this
app.get("/", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("homepage", templateVars);
});


// // This is an example
// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

//renders to urls_index
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("reg_form", templateVars);
});



// Shows a single shortURL with corresponding longURL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars); // renders templateVars variable to urls_show file
});

//  create a redirect to the longURL, main website.
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Create url.
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL; // set the post request body to a random string six string.
  res.redirect(`/urls/${shortURL}`);       // Respond with a  redirect URL using the generated shortURL-longURL pair
});

// Edit url
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL; // This retrieves the shortURL
  urlDatabase[shortURL] = req.body.longURL; // pair the new shortURL with provided (Edited) longURL.
  res.redirect(`/urls/${shortURL}`);      // Respond with a redirect to  urls list page
});

// Delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL; // This retrieves the corresponding shortURL
  delete urlDatabase[shortURL]; // delete its shortURL-longURL pair from the list
  res.redirect("/urls");   // redirecting to urls list page
});


app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");       // Respond with a  redirect URL using the generated shortURL-longURL pair
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");       // Respond with a  redirect URL using the generated shortURL-longURL pair
});

// Create a post request to handle registeration form
app.post("/register", (req, res) => {
  const newID = generateRandomString();
  const newUser = { id: newID, email: req.body.email, password: req.body.password  };
  users[ `user${newID}`] = newUser;
  res.cookie("user_id", newID);
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
