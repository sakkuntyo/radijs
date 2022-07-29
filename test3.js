const radijs = require("./index.js");

(async() => {
    console.log("番組表取得---")
    var channel_guide = await radijs.get_channel_guide();
    console.log(channel_guide);
})();
