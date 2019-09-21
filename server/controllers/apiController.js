const Users = require("../models/userModel");
const Transactions = require("../models/transactionModel");
const bodyParser = require("body-parser");

module.exports = function(app) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Users
  app.get("/api/user/list/:username", function(req, res) {
    Users.find({ name: req.params.username }, function(err, users) {
      if (err) throw err;

      res.send(users);
    });
  });

  app.get("/api/user/:id", function(req, res) {
    Users.findById({ _id: req.params.id }, function(err, user) {
      if (err) throw err;

      res.send(user);
    });
  });

  app.post("/api/user", function(req, res) {
    const data = {
      name: req.body.name,
      email_address: req.body.email_address,
      password: req.body.password
    };

    if (req.body.id) {
      Users.findByIdAndUpdate(req.body.id, data, function(err, todo) {
        if (err) throw err;

        res.send("Success");
      });
    } else {
      const newUser = Users(data);
      newUser.save(function(err) {
        if (err) throw err;
        res.send("Success");
      });
    }
  });

  app.delete("/api/user", function(req, res) {
    Users.findByIdAndRemove(req.body.id, function(err) {
      if (err) throw err;
      res.send("Success");
    });
  });

  // Transaction
  app.get("/api/transaction/list/:userid", function(req, res) {
    Transactions.find({ sender: req.params.userid }, function(
      err,
      transactions
    ) {
      if (err) throw err;

      res.send(transactions);
    });
  });

  app.get("/api/transaction/:id", function(req, res) {
    Transactions.findById({ _id: req.params.id }, function(err, transaction) {
      if (err) throw err;

      res.send(transaction);
    });
  });

  app.post("/api/transaction", function(req, res) {
    const data = {
      sender: req.body.sender,
      receiver: req.body.receiver,
      source_currency: req.body.source_currency,
      target_currency: req.body.target_currency,
      amount: req.body.amount,
      exchange_rate: req.body.exchange_rate,
      created_at: req.body.created_at,
      updated_at: req.body.updated_at
    };

    if (req.body.id) {
      Transactions.findByIdAndUpdate(req.body.id, data, function(err, todo) {
        if (err) throw err;

        res.send("Success");
      });
    } else {
      const newTransaction = Transactions(data);
      newTransaction.save(function(err) {
        if (err) throw err;
        res.send("Success");
      });
    }
  });

  app.delete("/api/transaction", function(req, res) {
    Transactions.findByIdAndRemove(req.body.id, function(err) {
      if (err) throw err;
      res.send("Success");
    });
  });
};
