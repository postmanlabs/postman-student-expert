/*
POSTMAN API STARTER

This API works in conjunction with the API Starter collecction in Postman to walk you through API basics.
Import the collection into Postman and send a request to the setup endpoint to begin.

This Glitch app is based on hello-express and low-db.

Below you'll see the code for the endpoints in the API after some initial setup processing
  - each endpoint begins "app." followed by get, post, patch, put, or delete, then the endpoint path, e.g. /cat
*/

/*
response structure:

{
    welcome:
      "Welcome! Check out the 'data' object below to see the values returned by the API. Click **Visualize** to see the 'tutorial' data " +
      "for this request in a more readable view.",
    data: {
      cat: {
        name: "Syd",
        humans: 9
      }
    },
    tutorial: {
      title: "You did a thing! 🚀",
      intro: "Here is the _intro_ to this **lesson**...",
      steps: [
        {
          note: "Here is a step with `code` in it...",
          pic:
            "https://assets.postman.com/postman-docs/postman-app-overview-response.jpg",
          raw_data: {
            cat: {
              name: "Syd",
              humans: 9
            }
          }
        }
      ],
      next: "Now do this...",
      pic:
        "https://assets.postman.com/postman-docs/postman-app-overview-response.jpg",
      raw_data: {
        cat: {
          name: "Syd",
          humans: 9
        }
      }
    }
  }
*/

// server.js
// where your node app starts

const express = require("express");
var bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// setup a new database persisted using async file storage
// Security note: the database is saved to the file `db.json` on the local filesystem.
// It's deliberately placed in the `.data` directory which doesn't get copied if someone remixes the project.
var low = require("lowdb");
var FileSync = require("lowdb/adapters/FileSync");
var adapter = new FileSync(".data/db.json");
var db = low(adapter);

// default cat list
db.defaults({
  matches: [
    {
      id: 1,
      creator: "postman",
      matchType: "League Cup Semi Final",
      opposition: "United",
      date: "Wed Mar 24 2021 14: 00: 04 GMT+0000 (Coordinated Universal Time)",
      points: -1
    },
    {
      id: 2,
      creator: "postman",
      matchType: "League Cup Quarter Final",
      opposition: "City",
      date: "Thu Jan 30 2020 20: 50: 46 GMT+0000 (Coordinated Universal Time)",
      points: 3
    },
    {
      id: 3,
      creator: "postman",
      matchType: "Friendly",
      opposition: "Athletic",
      date: "Wed Jan 13 2021 23: 01: 26 GMT+0000 (Coordinated Universal Time)",
      points: -1
    }
  ]
}).write();

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});

app.get("/training", (request, response) => {
  response.status(200).json({
    welcome:
      "Welcome to the Postman Student Expert training course! Check out the 'data' object below to see the values returned by this API request. "+
      "Click **Visualize** to see the 'tutorial' guiding you through next steps - do this for every request in the collection!",
    data: {
      course: "Postman Student Expert"
    },
    tutorial: {
      title: "Welcome to Postman Student Expert training! 🎒🎓",
      intro: "This API and the collection you imported into Postman will guide you through the steps required to become a student expert.",
      steps: [
        {
          note: "The request you sent to the student training API received a response including this data:",
          raw_data: {
            course: "Postman Student Expert"
          }
        },
        {
          note: "The responses will include JSON data that you can see in the **Body > Pretty** area. The **Visualize** view will show you this "+
            "more readable view of the 'tutorial' information in the response, including images that will help you understand each step."
        },
        {
          note: "Throughout the course, you will create, edit, and send requests inside Postman, and the responses will guide you onto next "+
            "steps. You will work through the requests in the collection folders, learning API and Postman skills along the way."
        }
      ],
      next: "Now get started by opening the next request `Get matches` and clicking **Send**.",
      pic:
        "https://assets.postman.com/postman-docs/postman-app-overview-response.jpg"
    }
  });
});

app.get("/matches", (request, response) => {
  var matches = db.get("matches").value(); 
  response.status(200).json({
    welcome:
      "Hi! Check out the 'data' object below to see the values returned by the API. Click **Visualize** to see the 'tutorial' data " +
      "for this request in a more readable view.",
    data: {
      matches: matches
    },
    tutorial: {
      title: "You sent a request to retrieve all matches for the team! 🎉",
      intro: "The demo API we're using for this course is a for a fictional sports team. The API manages match, player, and team data. ",
      steps: [
        {
          note: "Here is a step with `code` in it...",
          pic:
            "https://assets.postman.com/postman-docs/postman-app-overview-response.jpg",
          raw_data: {
            matches: matches
          }
        }
      ],
      next: "Now do this...",
      pic:
        "https://assets.postman.com/postman-docs/postman-app-overview-response.jpg",
      raw_data: {
        matches: matches
      }
    }
  });
});

/*
//generic get error
app.get("/*", (request, response) => {
  response.status(400).json({
    error:
      "🚧Oops this isn't a valid endpoint! " +
      "Try undoing your changes or closing the request without saving and opening it again from the collection on the left."
  });
});*/

//protect everything after this by checking for the secret - protect reset and clear here, above req personal key for post put del
app.use((req, res, next) => { 
  const apiSecret = req.get("match_key");
  if (!apiSecret) {
    res.status(401).json({
      title: "You got an unauthorized error response!",
      intro:
        "🚫Unauthorized - your secret needs to match the one on the server!",
      info: [
        {
          note: "tbc"
        }
      ],
      next: "tbc",
      pic: ""
    });
  } else if (apiSecret !== process.env.SECRET) {
    res.status(401).json({
      title: "You got an unauthorized error response!",
      intro:
        "🚫Unauthorized - your secret needs to match the one on the server!",
      info: [
        {
          note: "tbc"
        }
      ],
      next: "",
      pic: ""
    });
  } else {
    next();
  }
});

// removes entries from users and populates it with default users
app.get("/reset", (request, response) => {
  // removes all entries from the collection
  db.get("matches")
    .remove()
    .write();
  console.log("Database cleared");

  // default users inserted in the database
  var matches = [
    {
      id: 1,
      creator: "postman",
      matchType: "League Cup Semi Final",
      opposition: "United",
      date: "Wed Mar 24 2021 14: 00: 04 GMT+0000 (Coordinated Universal Time)",
      points: -1
    },
    {
      id: 2,
      creator: "postman",
      matchType: "League Cup Quarter Final",
      opposition: "City",
      date: "Thu Jan 30 2020 20: 50: 46 GMT+0000 (Coordinated Universal Time)",
      points: 3
    },
    {
      id: 3,
      creator: "postman",
      matchType: "Friendly",
      opposition: "Athletic",
      date: "Wed Jan 13 2021 23: 01: 26 GMT+0000 (Coordinated Universal Time)",
      points: -1
    }
  ];

  matches.forEach(match => {
    db.get("matches")
      .push({
        id: match.id,
        creator: match.creator,
        matchType: match.matchType,
        opposition: match.opposition,
        date: match.date,
        points: match.points
      })
      .write();
  });
  console.log("Default matches added");
  response.redirect("/");
});

// removes all entries from the collection
app.get("/clear", (request, response) => {
  // removes all entries from the collection
  db.get("matches")
    .remove()
    .write();
  console.log("Database cleared");
  response.redirect("/");
});

//errors
app.post("/*", (request, response) => {
  response.status(400).json({
    error:
      "🚧Oops this isn't a valid endpoint! " +
      "Try undoing your changes or closing the request without saving and opening it again from the collection on the left."
  });
});
app.put("/*", (request, response) => {
  response.status(400).json({
    error:
      "🚧Oops this isn't a valid endpoint! " +
      "Try undoing your changes or closing the request without saving and opening it again from the collection on the left."
  });
});
app.patch("/*", (request, response) => {
  response.status(400).json({
    error:
      "🚧Oops this isn't a valid endpoint! " +
      "Try undoing your changes or closing the request without saving and opening it again from the collection on the left."
  });
});
app.delete("/*", (request, response) => {
  response.status(400).json({
    error:
      "🚧Oops this isn't a valid endpoint! " +
      "Try undoing your changes or closing the request without saving and opening it again from the collection on the left."
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
