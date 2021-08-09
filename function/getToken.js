let aescode = require("../function/aescode");
module.exports.writeoauthToken = function (token, id) {
  let code = aescode.aesEncode(token, id);
  var b = Buffer.from(code);
  var s = b.toString("base64");
  return s;
};
module.exports.getoauthToken = function (Detoken, id) {
  if (!id) return Detoken;
  var b = Buffer.from(Detoken, "base64");
  var s = b.toString();
  let code = aescode.aesDecode(s, id);
  return code;
};
