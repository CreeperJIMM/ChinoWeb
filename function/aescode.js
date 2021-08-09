const crypto = require("crypto");
//建立加密演算法
module.exports.aesEncode = function (data, key) {
  const cipher = crypto.createCipher("aes192", key);
  var crypted = cipher.update(data, "utf8", "hex");
  crypted += cipher.final("hex");
  return crypted;
};
//建立解密演算法
module.exports.aesDecode = function (encrypted, key) {
  const decipher = crypto.createDecipher("aes192", key);
  var decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
