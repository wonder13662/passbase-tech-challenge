var express = require("express");
var app = express();
var mongoose = require("mongoose");
var config = require("./config");
var apiController = require("./controllers/apiController");

var port = process.env.PORT || 3001;

mongoose.connect(config.getDbConnectionString());
apiController(app);
app.listen(port);
