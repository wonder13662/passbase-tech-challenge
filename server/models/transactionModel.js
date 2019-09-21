var mongoose = require("mongoose");
var timestamps = require("mongoose-timestamp");

var Schema = mongoose.Schema;

var transactionSchema = new Schema(
  {
    sender_id: String,
    sender_name: String,
    receiver_id: String,
    receiver_name: String,
    source_currency: String,
    target_currency: String,
    amount: Number,
    exchange_rate: Number
  },
  { collection: "transactions" }
);
transactionSchema.plugin(timestamps, {
  createdAt: "created_at",
  updatedAt: "updated_at"
});

var Transactions = mongoose.model("Transactions", transactionSchema);

module.exports = Transactions;
