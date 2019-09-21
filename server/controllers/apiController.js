var Users = require("../models/userModel");
var Transactions = require("../models/transactionModel");
var bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
var Const = require("../../src/const");

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

  app.post("/api/login", function(req, res) {
    console.log("req.body.password:", req.body.password);

    // 1. Fetch the user by email
    Users.findOne(
      {
        email_address: req.body.email_address
      },
      function(err, user) {
        if (err) throw err;

        if (!user || !user.password) {
          res.send(Object.assign({}, { success: false, userid: "" }));
        } else {
          // 2. Compare password by bcryptjs
          var isIdentical = bcrypt.compareSync(
            req.body.password,
            user.password
          );
          res.send(
            Object.assign({}, { success: isIdentical, userid: user.id })
          );
        }
      }
    );
  });

  app.post("/api/user", function(req, res) {
    var data = {
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
      var newUser = Users(data);
      newUser.save(function(err) {
        if (err) throw err;

        // Add 1000 USD Transaction
        var data = {
          sender_id: "passbase",
          sender_name: "passbase",
          receiver_id: newUser.id,
          receiver_name: newUser.name,
          source_currency: Const.CURRENCY.USD,
          target_currency: Const.CURRENCY.USD,
          amount: 1000,
          exchange_rate: req.body.exchange_rate
        };
        addTransaction(
          req,
          res,
          data,
          Object.assign({}, { userid: newUser.id })
        );
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
    Transactions.find(
      {
        $or: [
          { receiver_id: req.params.userid },
          { sender_id: req.params.userid }
        ]
      },
      function(err, transactions) {
        if (err) throw err;

        res.send(transactions);
      }
    );
  });

  app.get("/api/transaction/:id", function(req, res) {
    Transactions.findById({ _id: req.params.id }, function(err, transaction) {
      if (err) throw err;

      res.send(transaction);
    });
  });

  function addTransaction(req, res, data, payload) {
    var newTransaction = Transactions(data);
    newTransaction.save(function(err) {
      if (err) throw err;
      !!payload ? res.send(payload) : res.send("Success");
    });
  }

  app.post("/api/transaction", function(req, res) {
    var data = {
      sender_id: req.body.sender,
      sender_name: req.body.sender_name,
      receiver_id: req.body.receiver,
      receiver_name: req.body.receiver_name,
      source_currency: req.body.source_currency,
      target_currency: req.body.target_currency,
      amount: req.body.amount,
      exchange_rate: req.body.exchange_rate
    };

    if (req.body.id) {
      Transactions.findByIdAndUpdate(req.body.id, data, function(err, todo) {
        if (err) throw err;
        res.send("Success");
      });
    } else {
      addTransaction(req, res, data);
    }
  });

  app.delete("/api/transaction", function(req, res) {
    Transactions.findByIdAndRemove(req.body.id, function(err) {
      if (err) throw err;
      res.send("Success");
    });
  });
};
