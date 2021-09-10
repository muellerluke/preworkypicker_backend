const fs = require('fs');
const http = require('http');
const https = require('https');
const mysql = require('mysql');
const express = require('express');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
const privateKey  = fs.readFileSync('/opt/bitnami/apache/conf/bitnami/certs/server.key', 'utf8');
const certificate = fs.readFileSync('/opt/bitnami/apache/conf/bitnami/certs/server.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 80 // limit each IP to 100 requests per windowMs
});
const app = express();
const connection = mysql.createConnection({
  host: "localhost",
  user: "application",
  password: "pr3W0rkYP1cK3r",
  database: "db1"
});
connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected to DB");
});

app.use(limiter);
app.use(express.json());
let whitelist = ['https://preworkypicker.com', 'https://preworkypicker.com/', 'http://preworkypicker.com', 'http://localhost:3000/', 'http://localhost:3000'];

app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin
    if(!origin) return callback(null, true);
    if(whitelist.indexOf(origin) === -1){
      var message = "The CORS policy for this origin doesn't" +
                'allow access from the particular origin.';
      return callback(new Error(message), false);
    }
    return callback(null, true);
  }
}));

app.get('/', (req, res) => {
  //get all column names
  connection.query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = Database() AND TABLE_NAME = 'Preworkouts'", function(err, rows, fields)
  {
    if (err) {
      res.send("Error: " + err);
      console.log(err);
    }
    //array of objects with COLUMN_NAME as key value
    var results = Object.values(JSON.parse(JSON.stringify(rows)));
    res.send(results);
  });
});

app.post('/search', (req, res) => {
  let bodyArr = req.body;
  console.log(bodyArr);
  let queryStatement = "SELECT * FROM db1.Preworkouts WHERE ";
  let sign = "";
  bodyArr.forEach((obj, i) => {
    queryStatement = queryStatement +  "`" + obj.ingredient + "` " + obj.sign + " " + obj.value + " AND ";
  });
  queryStatement = queryStatement.substring(0, queryStatement.length - 4) + ";";
  console.log(queryStatement);

  connection.query(queryStatement, function(err, rows)
  {
    if (err) {
      res.send("Error: " + err);
      console.log(err);
    }
    res.send(rows);
  });
});

https.createServer({
  key: privateKey,
  cert: certificate
}, app).listen(8080, function () {
  console.log('Example app listening on port preworkypicker.com:8080')
})
