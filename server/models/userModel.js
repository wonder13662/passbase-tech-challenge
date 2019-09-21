var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    name: String,
    email_address: String,
    password: String
  },
  { collection: "users" }
);

var Users = mongoose.model("Users", userSchema);

module.exports = Users;
