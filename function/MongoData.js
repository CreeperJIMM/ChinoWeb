module.exports.loadUser = async (client, userid) => {
  /*讀取用戶檔案*/ let dbo = client.db("mydb"),
    id = userid,
    query = { id: id };
  let user = await dbo.collection("users").find(query).toArray();
  if (user[0] === undefined) return false;
  user = user[0][id];
  return user;
};

module.exports.writeUser = function (client, id, data) {
  /*寫入用戶檔案*/ let dbo = client.db("mydb"),
    query = { [id]: Object };
  let user = dbo.collection("users").find(query).toArray();
  var myquery = { id: id };
  user[id] = data;
  var newvalues = { $set: user };
  dbo.collection("users").updateOne(myquery, newvalues, function (err, res) {
    if (err) return err;
  });
}
module.exports.loadGuild = async (client, guildid) => {
  /*讀取公會檔案*/ let dbo = client.db("mydb"),
    id = guildid,
    query = { id: id };
  let user = await dbo.collection("guilds").find(query).toArray();
  if (user[0] === undefined) return false;
  user = user[0][id];
  return user;
};
module.exports.writeGuild = function(client, id, data) {
  /*寫入公會檔案*/ let dbo = client.db("mydb"),
    query = { [id]: Object };
  let user = dbo.collection("guilds").find(query).toArray();
  var myquery = { id: id };
  user[id] = data;
  var newvalues = { $set: user };
  dbo.collection("guilds").updateOne(myquery, newvalues, function (err, res) {
    if (err) return err;
  });
}
module.exports.loadDaily = async (client) => {
  /*讀取用戶檔案*/ let dbo = client.db("mydb"),
    query = { id:"daily" };
  let user = await dbo.collection("daily").find(query).toArray();
  if (user[0] === undefined) return false;
  user = user[0];
  return user;
};

module.exports.writeDaily = function (client, data) {
  /*寫入用戶檔案*/ let dbo = client.db("mydb"),
    query = { id:"daily" };
  let user = dbo.collection("daily").find(query).toArray();
  var myquery = { id:"daily" };
  user = data;
  var newvalues = { $set: user };
  dbo.collection("daily").updateOne(myquery, newvalues, function (err, res) {
    if (err) return err;
  });
}

module.exports.loadOuath = async (client, userid,type) => {
  /*讀取用戶檔案*/ let dbo = client.db("mydb"),typer = "discord_id"
  if(type) {if(type === "google") typer = "google_id"}
    let id = userid,
    query = { [typer]: id };
  let user = await dbo.collection("oauth").find(query).toArray();
  if (user[0] === undefined) return false;
  user = user[0];
  return user;
};

module.exports.writeOauth = function (client, id,type, data) {
  /*寫入用戶檔案*/ let dbo = client.db("mydb"),typer = "discord_id"
    if(type) {if(type === "google") typer = "google_id"}
    query = { [typer]: id };
  let user = dbo.collection("oauth").find(query).toArray();
  var myquery = { [typer]: id };
  user = data;
  var newvalues = { $set: user };
  dbo.collection("oauth").updateOne(myquery, newvalues, function (err, res) {
    if (err) return err;
  });
}