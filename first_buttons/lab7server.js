var express=require('express'),
app = express(),
port = process.env.PORT || 1337;

var mysql = require('mysql');

var credentials = require('../credentials.json');
credentials.host = "ids"; 

function fetchButtons(res){
  var connection = mysql.createConnection(credentials);
  connection.connect(function(err) {
	if(err) {
		console.log("Error connecting to the database");
	}
  });
  var query = 'SELECT * FROM schr1230.till_buttons';
  connection.query(query, function(err,rows,fields) {
	if(err) {
		console.log("Error connecting to the database");
	} else {
		res.send(rows);
	}
  });
  connection.end();
}
app.use(express.static(__dirname + '/public')); //Serves the web pages
app.get("/buttons",function(req,res){ // handles the /buttons API
  fetchButtons(res);
});

app.listen(port);
