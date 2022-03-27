const bcrypt = require('bcryptjs'); // bcryptjs a JS variant of bcrypt use to hash password.
// urlDatabase holds list of users and their created url.

// Sample database for created user's shortURL-longURL 
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

// Sample Database for Registered users
const users = {
  "userRandomID": {
    userID: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },  '81p1w0': { userID: '81p1w0', email: 'ezike_iyke@yahoo.com', password: '123' },
  wtjrw5: { userID: 'wtjrw5', email: 'benjamin.node@gmail.com', password: 'come' }
};

// Helper function to check a user exits with a given email
const getUserByEmail = function(emailAddress, users) {
  for (let user in users) {
    if (users[user]["email"] === emailAddress) {
      return users[user]["userID"];
    }
  }
};

// Helper function to check a user exits with a given url
const urlUserIDMatch = function(longURL, urlDatabase) {
  for(let url in urlDatabase) {
    if (urlDatabase[url]["longURL"] == longURL) {
      return urlDatabase[url]["userID"];
    }
  }
};

// generates a random alphanumeric string of length six
const generateRandomString = function() {
  return Math.random().toString(36).substring(2,8); 
};

module.exports = { 

  getUserByEmail, 
  urlUserIDMatch, 
  generateRandomString,

};