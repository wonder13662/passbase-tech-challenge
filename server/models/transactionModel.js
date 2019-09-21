var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var transactionSchema = new Schema(
  {
    sender: String,
    receiver: String,
    source_currency: String,
    target_currency: String,
    amount: Number,
    exchange_rate: Number,
    created_at: String,
    updated_at: String
  },
  { collection: "transactions" }
);

var Transactions = mongoose.model("Transactions", transactionSchema);

module.exports = Transactions;
