var configValues = require("./config");

module.exports = {
  getDbConnectionString: function() {
    return `mongodb+srv://${configValues.uname}:${configValues.pwd}@myfirstcluster-y31qy.mongodb.net/test?retryWrites=true&w=majority`;
  }
};
