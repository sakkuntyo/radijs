const radijs = require("./index.js");

(async() => {
  console.log(await radijs.get_authtoken());
  console.log(await radijs.get_bangumi_uri("TBS"));
})();
