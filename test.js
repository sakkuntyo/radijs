const radijs = require("./index.js");

(async() => {
  console.log("トークン取得---")
  console.log(await radijs.get_authtoken());
  console.log("局URL取得---")
  console.log(await radijs.get_bangumi_uri("TBS"));
  console.log("局一覧取得")
  console.dir(await radijs.get_station_id_list());
})();
