const radijs = require("./index.js");

(async() => {
  console.log(await radijs.get_authtoken());
})();
