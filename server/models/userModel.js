var mongoose = require("mongoose");
var timestamps = require("mongoose-timestamp");

var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    name: String,
    email_address: String,
    password: String
  },
  { collection: "users" }
);
userSchema.plugin(timestamps, {
  createdAt: "created_at",
  updatedAt: "updated_at"
});

var Users = mongoose.model("Users", userSchema);

module.exports = Users;
