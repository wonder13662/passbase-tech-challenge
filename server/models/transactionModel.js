var mongoose = require("mongoose");
var timestamps = require("mongoose-timestamp");

var Schema = mongoose.Schema;

var transactionSchema = new Schema(
  {
    sender_id: String,
    sender_name: String,
    receiver_id: String,
    receiver_name: String,
    sender_currency: String,
    receiver_currency: String,
    sender_amount: Number,
    receiver_amount: Number,
    exchange_rate: Number,
    success: Boolean
  },
  { collection: "transactions" }
);
transactionSchema.plugin(timestamps, {
  createdAt: "created_at",
  updatedAt: "updated_at"
});

var Transactions = mongoose.model("Transactions", transactionSchema);

module.exports = Transactions;
