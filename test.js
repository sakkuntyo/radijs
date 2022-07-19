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
  var dirName = "test"
  try {
    fs.mkdirSync(dirName);
  } catch {
  }
  var bangumim3u8filepath = `${dirName}/` + Math.random().toString(32).substring(2) + ".m3u8"
  await new Promise((resolve, reject) => {
    child.exec(`wget "${bangumiuri}" --header="X-Radiko-Authtoken: ${authtoken}" -O "${bangumim3u8filepath}";sync`,
      (error, stdout, stdin) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout); 
      }
    });
  });


  var chunklisturi = (await radijs.get_m3u8_info(`./${bangumim3u8filepath}`))[0];
  var chunkm3u8filepath = `${dirName}/` + Math.random().toString(32).substring(2) + ".m3u8"
  await new Promise((resolve, reject) => {
    child.exec(`wget "${chunklisturi}" --header="X-Radiko-Authtoken: ${authtoken}" -O "${chunkm3u8filepath}";sync`,
      (error, stdout, stdin) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout); 
      }
    });
  });
  chunklisturls = await radijs.get_m3u8_info(`${chunkm3u8filepath}`);
  await new Promise((resolve, reject) => {
    chunklisturls.forEach(async function(element, index, array){
      child.exec(`cd ${dirName};wget "${element}" --header="X-Radiko-Authtoken: ${authtoken}";sync`, (error, stdout, stdin) => {
      if (error) {
          reject(error);
        } else {
	  if(chunklisturls.length == index + 1){
            resolve(stdout); 
	  }
        }
      });
    });
  });
  fs.rmSync(`${dirName}`,{ recursive: true, force: true });
})();
