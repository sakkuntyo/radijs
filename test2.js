const radijs = require("./index.js");

(async() => {
    console.log("トークン取得---")
    var authtoken = await radijs.get_authtoken();
    console.log(authtoken);

    console.log("局URL取得---")
    var bangumiuri = await radijs.get_bangumi_uri("TBS");
    console.log(bangumiuri);
    
    console.log("chunkurl取得---")
    console.log(await radijs.get_m3u8(bangumiuri,authtoken));
})();
