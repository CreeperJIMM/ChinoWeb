let tokencloud = require("../token.json");
var fetch = require('node-fetch')

module.exports = function (IP) {
  let bodys = { type: "A", name: ".", content: IP, proxied: true };
  bodys = JSON.stringify(bodys);
  fetch.default(
      "https://api.cloudflare.com/client/v4/zones/e3e93f8298056a1850b209aa25d56d71/dns_records",
      {
        method: "GET",
        headers: {
          Authorization: tokencloud.Authorization,
          "Content-Type": "application/json",
        },
      }
    )
    .then(async (data) => {
      return data.json();
    })
    .then((data2) => {
      fetch.default(
          "https://api.cloudflare.com/client/v4/zones/e3e93f8298056a1850b209aa25d56d71/dns_records/" +
            data2.result[0].id,
          {
            method: "PUT",
            headers: {
              Authorization: tokencloud.Authorization,
              "Content-Type": "application/json",
            },
            body: bodys,
          }
        )
        .then(async (data) => {
          return data.json();
        })
        .then((data2) => {
          console.log("成功更新IP1");
        });
    });
};
