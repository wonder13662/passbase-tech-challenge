import bcrypt from "bcryptjs";

export default {
  encryptStr: function(raw) {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(raw, salt);
  },
  alertError: function() {
    alert("Sorry for your unconvenience.\nWe will fix this issue shortly.");
  }
};
