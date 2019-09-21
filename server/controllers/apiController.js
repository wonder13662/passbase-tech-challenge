var Users = require("../models/userModel");
var Transactions = require("../models/transactionModel");
var bodyParser = require("body-parser");
var bcrypt = require("bcryptjs");
var Const = require("../../src/const");

module.exports = function(app) {
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  function filterUser(user) {
    return {
      created_at: user.created_at,
      email_address: user.email_address,
      name: user.name,
      updated_at: user.updated_at,
      _id: user._id,
      id: user._id
    };
  }

  // Users
  app.get("/api/user/list", function(req, res) {
    Users.find({}, function(err, users) {
      if (err) throw err;

      res.send(
        users.map(user => {
          return filterUser(user);
        })
      );
    });
  });

  app.get("/api/user/list/:username", function(req, res) {
    Users.find({ name: req.params.username }, function(err, users) {
      if (err) throw err;

      res.send(
        users.map(user => {
          return filterUser(user);
        })
      );
    });
  });

  app.get("/api/user/:id", function(req, res) {
    Users.findById({ _id: req.params.id }, function(err, user) {
      if (err) throw err;

      res.send(filterUser(user));
    });
  });

  app.post("/api/login", function(req, res) {
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

  app.post("/api/signup", function(req, res) {
    var data = {
      name: req.body.name,
      email_address: req.body.email_address,
      password: req.body.password
    };

    Users.findOne(
      {
        email_address: req.body.email_address
      },
      function(err, user) {
        if (err) throw err;

        if (!!user) {
          res.send({
            success: false,
            reason: "Unfortunately this email has been registred already"
          });
        } else {
          var newUser = Users(data);
          newUser.save(function(err) {
            if (err) throw err;

            // Add 1000 USD Transaction
            var data = {
              sender_id: "passbase",
              sender_name: "passbase",
              sender_currency: Const.CURRENCY.USD,
              sender_amount: 1000,
              receiver_id: newUser.id,
              receiver_name: newUser.name,
              receiver_currency: Const.CURRENCY.USD,
              receiver_amount: 1000,
              exchange_rate: 1,
              success: true
            };
            addTransaction(req, res, data, {
              userid: newUser.id,
              success: true
            });
          });
        }
      }
    );
  });

  app.delete("/api/user", function(req, res) {
    Users.findByIdAndRemove(req.body.id, function(err) {
      if (err) throw err;
      res.send({ success: true });
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
    // 실패 상황을 가정
    var randomFailure = Math.random() * 9 + 1; // 1/10
    if (2 < randomFailure && randomFailure < 6) {
      data.success = false;
      payload = Object.assign({}, payload, { success: data.success });
    }

    var newTransaction = Transactions(data);

    newTransaction.save(err => {
      if (err) throw err;
      !!payload ? res.send(payload) : res.send({ success: data.success });
    });
  }

  app.post("/api/transaction", function(req, res) {
    var data = {
      sender_id: req.body.sender_id,
      sender_name: req.body.sender_name,
      sender_currency: req.body.sender_currency,
      sender_amount: req.body.sender_amount,
      receiver_id: req.body.receiver_id,
      receiver_name: req.body.receiver_name,
      receiver_currency: req.body.receiver_currency,
      receiver_amount: req.body.receiver_amount,
      exchange_rate: req.body.exchange_rate,
      success: true
    };
    addTransaction(req, res, data);
  });

  app.post("/api/transaction/fail", function(req, res) {
    var data = {
      sender_id: req.body.sender_id,
      sender_name: req.body.sender_name,
      sender_currency: req.body.sender_currency,
      sender_amount: req.body.sender_amount,
      receiver_id: req.body.receiver_id,
      receiver_name: req.body.receiver_name,
      receiver_currency: req.body.receiver_currency,
      receiver_amount: req.body.receiver_amount,
      exchange_rate: req.body.exchange_rate,
      success: false
    };
    addTransaction(req, res, data);
  });

  app.delete("/api/transaction", function(req, res) {
    Transactions.findByIdAndRemove(req.body.id, function(err) {
      if (err) throw err;
      res.send({ success: true });
    });
  });
};
