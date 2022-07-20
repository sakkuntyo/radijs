const radijs = require("./index.js");
const fs = require("fs");
const axios = require("axios");
const child = require('child_process');

(async() => {
  console.log("トークン取得---")
  var authtoken = await radijs.get_authtoken();
  console.log(authtoken);

  console.log("局URL取得---")
  var bangumiuri = await radijs.get_bangumi_uri("TBS");
  console.log(bangumiuri);

  console.log("局一覧取得")
  console.dir(await radijs.get_station_id_list());

  console.log("m3u8プレイリスト取得")
  dirName = "test"
  try {
    fs.mkdirSync(dirName);
  } catch(e) {
    console.log(e)
  }
  var bangumim3u8filepath = `${dirName}/` + Math.random().toString(32).substring(2) + ".m3u8"
  m3u8filePath = `${dirName}/` + Math.random().toString(32).substring(2) + ".m3u8"
  await radijs.get_m3u8_file(bangumiuri, authtoken, m3u8filePath)

  console.log("m3u8プレイリスト情報取得")
  chunkm3u8uri = await radijs.get_m3u8_info(m3u8filePath)

  console.log("m3u8プレイリスト取得")
  var bangumim3u8filepath = `${dirName}/` + Math.random().toString(32).substring(2) + ".m3u8"
  chunkm3u8filePath = `${dirName}/` + Math.random().toString(32).substring(2) + ".m3u8"
  await radijs.get_m3u8_file(chunkm3u8uri, authtoken, chunkm3u8filePath)
 
  console.log("m3u8プレイリスト情報取得")
  console.log(await radijs.get_m3u8_info(chunkm3u8filePath))

  console.log("mp3 取得")
  audioDirName = dirName + "/audio"
  fs.rmSync(`${audioDirName}`,{ recursive: true, force: true });
  try {
    fs.mkdirSync(dirName);
  } catch(e) {
    console.log(e)
  }
  chunklisturls = await radijs.get_m3u8_info(`${chunkm3u8filePath}`);
  await radijs.download_mp3_file(chunkm3u8filePath, authtoken, audioDirName);
})();
