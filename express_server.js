const express = require("express"); // import express, a framework to simpler server
const bcrypt = require('bcryptjs'); // bcryptjs a JS variant of bcrypt use to hash password.
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

// urlDatabase holds list of users and their created url.
const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "aJ48lW"
    },
    i3BoGr: {
        longURL: "https://www.google.ca",
        userID: "jJ48lW"
    }
};

// Database for Registered users
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },  '81p1w0': { id: '81p1w0', email: 'ezike_iyke@yahoo.com', password: '123' },
  wtjrw5: { id: 'wtjrw5', email: 'benjamin.node@gmail.com', password: 'come' }
};

const checkRegUser = function(emailAddress) {
  for (let user in users) {
    if (users[user]["email"] === emailAddress) {
      return users[user].id;
    }
  }
  return false;
};

const emailPasswordMatch = function(emailAddress, password) {
  console.log(emailAddress, password)
  console.log(users[checkRegUser(emailAddress)]["password"], password)
  if (!checkRegUser(emailAddress)) {
    return false;
  }
  if( bcrypt.compareSync(password, users[checkRegUser(emailAddress)]["password"])) {
    return true
  }
  return false;
}
const urlUserIDMatch = function(url, user_id) {
  for(let key in urlDatabase) {
    if (urlDatabase[key]["userID"] === user_id && urlDatabase[key]["longURL"] === url) {
      return true;
    }
  }
  return false;
};

const checkUserURLs = function(userId) {
  for (let key in urlDatabase) {
    if (urlDatabase[key]["userID"] === userId) {
      return userId
    }
  }
  return false
}


// // Playaround with this
// app.get("/", (req, res) => {
//   console.log(req.cookies)
//   const templateVars = { username: req.cookies };
//   console.log(templateVars)
//   res.render("homepage", templateVars);
// });


//renders to urls_index
app.get("/urls", (req, res) => {
  const urlFilter = {};
  for ( let url in urlDatabase) {
    if (urlDatabase[url]["userID"] === req.cookies["user_id"]) {
      urlFilter[url] = urlDatabase[url];
    }
  }
  const templateVars = { urls: urlFilter, user: users[req.cookies["user_id"]] };
  res.render("urls_index",  templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {  user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("reg_form", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { user: users[req.cookies["user_id"]]};
  res.render("login_form", templateVars);
});


// Shows a single shortURL with corresponding longURL 
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]["longURL"],
    // longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars); // renders templateVars variable to urls_show file
});

// Get request for redirect to the longURL, main website.
app.get("/u/:shortURL", (req, res) => {
  // const longURL = urlDatabase[req.params.shortURL];
  const longURL = urlDatabase[req.params.shortURL]["longURL"]
  res.redirect(longURL);
});

// Create url.
app.post("/urls", (req, res) => {
  let userNewPage = {};
  if (!req.cookies["user_id"]){
    return res.redirect("/login");
  } 
  const shortURL = generateRandomString()
  userNewPage = { longURL: req.body.longURL, userID: req.cookies["user_id"] }
  urlDatabase[shortURL] = userNewPage;
  res.redirect(`/urls/${shortURL}`);       // Respond with a  redirect URL using the generated shortURL-longURL pair
});

// Createn a route to handle edit url
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL; // This retrieves the shortURL
  if (!req.cookies["user_id"]){
    return res.redirect("/login");
  }
  if (!urlUserIDMatch(urlDatabase[shortURL]["longURL"], req.cookies["user_id"])) {
    return res.send(" Not authorized to Edit url");
  }
  urlDatabase[shortURL]["longURL"]  = req.body.longURL; // pair the new shortURL with provided (Edited) longURL.
  res.redirect(`/urls/${shortURL}`);      // Respond with a redirect to  urls list page
});

// Creat a route to handle delete url
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL; 
  if (!req.cookies["user_id"]){
    return res.redirect("/login");
  }
  if (!urlUserIDMatch(urlDatabase[shortURL]["longURL"], req.cookies["user_id"])) {
    return res.send(" Not authorized to delete url")
  }
  delete urlDatabase[shortURL]; // delete its shortURL-longURL pair from the list
  res.redirect("/urls");   // redirecting to urls list page
});


// Create a login route
app.post("/login", (req, res) => {
  const currentEmail = req.body.email;
  const currentPassword = req.body.password; 
  // const currentPassword = bcrypt.hashSync(req.body.password, 10); 
  if (req.body.email === "" || req.body.password === "") {
    return res.send("Invalid User");
  }
  if(!checkRegUser(currentEmail)) {
    return res.send("Invalid User");
  }
  if (!emailPasswordMatch(currentEmail, currentPassword)){
    return res.send("email does not match password");
  }
  res.cookie("user_id", checkRegUser(currentEmail));
  res.redirect("/urls");       // Respond with a  redirect URL using the generated shortURL-longURL pair
});

// Create logout route
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");       // Respond with a  redirect URL using the generated shortURL-longURL pair
});


// Create a route to handle registeration form
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.send("Invalid User");
  }
  if (checkRegUser(req.body.email)) {
    return res.send("Email already exit");
  }
  const newID = generateRandomString();
  const newUser = { id: newID, email: req.body.email, password: bcrypt.hashSync(req.body.password, 10) };
  users[newID] = newUser;
  res.cookie("user_id", newID);
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
