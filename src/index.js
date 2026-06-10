const express = require("express");
const bodyParser = require("body-parser");
const https = require("https");
require("dotenv").config();

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function (req, res) {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  const data = {
    email_address: email,
    status: "subscribed",
    merge_fields: {
      FNAME: firstName,
      LNAME: lastName,
      ADDRESS: {
        addr1: "123 Main St",
        addr2: "Apt 4B",
        city: "Anytown",
        state: "CA",
        zip: "12345",
        country: "US",
      },
      PHONE: "555-555-5555",
      BIRTHDAY: "01/01",
      COMPANY: "Example Company",
    },
  };

  const jsonData = JSON.stringify(data);

 

  const url = `https://us6.api.mailchimp.com/3.0/lists/40280a90bf/members`;

 

  const options = {
    method: "POST",
    auth:  `smitho:${process.env.MAILCHIMP_API_KEY}`,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(jsonData),
    },
  };

  const mailchimpRequest = https.request(url, options, function (response) {
    console.log("Status Code:", response.statusCode);

    let body = "";

    response.on("data", function (chunk) {
      body += chunk;
    });

    response.on("end", function () {
      console.log("Mailchimp Response:");
      console.log(body);

      if (response.statusCode === 200 || response.statusCode === 201) {
        res.sendFile(__dirname + "/success.html");
      } else {
        res.sendFile(__dirname + "/failure.html");
      }
    });
  });

  mailchimpRequest.on("error", function (error) {
    console.error("Request Error:", error);
    res.sendFile(__dirname + "/failure.html");
  });

  mailchimpRequest.write(jsonData);
  mailchimpRequest.end();
});

app.post("/failure", function (req, res) {
  res.redirect("/");
});

const port = process.env.PORT;

app.listen( port, function () {
  console.log(`Server is running on port ${port || 3000 }`);
});