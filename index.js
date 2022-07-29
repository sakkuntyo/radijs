// general settings
const axios = require('axios').default;
const fs   = require('fs');
const child = require('child_process');
const convert = require('xml-js');


// xml parser settings 
const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');
const options = {
	    ignoreAttributes: false,
	    format: true,
};
const parser = new XMLParser(options);

// m3u8 parser settings
const m3u8 = require('m3u8');

(function(module) {
    'use strict';

    module.exports.get_authtoken = get_authtoken;
    module.exports.get_bangumi_uri = get_bangumi_uri;
    module.exports.get_station_id_list = get_station_id_list;
    module.exports.get_m3u8_file = get_m3u8_file;
    module.exports.get_m3u8_info = get_m3u8_info;
    module.exports.get_m3u8 = get_m3u8;
    module.exports.download_mp3_file = download_mp3_file;
    module.exports.get_channel_guide = get_channel_guide;
    async function get_authtoken() {
	// Define authorize key value (from https://radiko.jp/apps/js/playerCommon.js)
        var RADIKO_AUTHKEY_VALUE = "bcd151073c03b352e1ef2fd66c32209da9ca0afa";
        var auth1_res = await axios.get("https://radiko.jp/v2/api/auth1",{"headers":{ "X-Radiko-App": "pc_html5","X-Radiko-App-Version": "0.0.1","X-Radiko-Device": "pc", "X-Radiko-User": "dummy_user"}});
        var authtoken = auth1_res.headers['x-radiko-authtoken'];
        var keyoffset = auth1_res.headers['x-radiko-keyoffset'];
        var keylength = auth1_res.headers['x-radiko-keylength'];
        var partialkey = RADIKO_AUTHKEY_VALUE.substring(keyoffset,parseInt(keylength) + parseInt(keyoffset));
        /*
        console.log("RADIKO_AUTHKEY_VALUE -> " + RADIKO_AUTHKEY_VALUE)
        console.log("keyoffset -> " + keyoffset)
        console.log("keylength -> " + keylength)
        console.log("keylength+keyoffset -> " + (parseInt(keylength) + parseInt(keyoffset)))
        console.log("partialkey -> "+ partialkey)
        console.log("base64partialkey" + Buffer.from(partialkey).toString('base64'))
	*/
	await axios.get("https://radiko.jp/v2/api/auth2",{"headers":{ "X-Radiko-Device": "pc", "X-Radiko-User": "dummy_user", "X-Radiko-AuthToken": authtoken, "X-Radiko-PartialKey": Buffer.from(partialkey).toString('base64')}});
        // 上記が特に失敗しないなら authtoken を 返す
        return authtoken
    };

    async function get_bangumi_uri(stationId) {
	var bangumi_response = await axios.get(`https://radiko.jp/v2/station/stream_smh_multi/${stationId}.xml`);
        var aaa = parser.parse(bangumi_response.data);
	return aaa.urls.url[0].playlist_create_url;
    };

    async function get_station_id_list() {
	var stationlist_response = await axios.get("https://radiko.jp/v3/station/region/full.xml");
        var stationlist_response_xmlparse = parser.parse(stationlist_response.data);
	var stationlist = [];
	stationlist_response_xmlparse.region.stations.forEach(nested => {
            nested.station.forEach(nested => {
                stationlist.push(nested.id);
	    })
	});
        stationlist = Array.from(new Set(stationlist));
        console.log(stationlist)
        return stationlist;
    };
    
    async function get_m3u8_info(path) {
        return new Promise((resolve, reject) => {
          var parser = m3u8.createStream();
          var file   = fs.createReadStream(path);
          file.pipe(parser);
	  var urls = []

          parser.on('item', function(item) {
              // emits PlaylistItem, MediaItem, StreamItem, and IframeStreamItem
              //console.log("item")
              urls.push(item.properties.uri);
          });
          parser.on('m3u', function(m3u) {
	      
          });
          parser.on('end', function() {
	      resolve(urls);
          });
        });
    }
    
    async function get_m3u8_file(url, authToken, outputFilepath) {
        return new Promise(async (resolve, reject) => {
            child.exec(`wget "${url}" --header="X-Radiko-Authtoken: ${authToken}" -O "${outputFilepath}";sync`,
              (error, stdout, stdin) => {
              if (error) {
                reject(error);
              } else {
                resolve(stdout); 
              }
            });
        });
    }

    async function get_m3u8(url, authToken) {
        return new Promise((resolve, reject) => {
            //axios.get(url, {headers: {'X-Radiko-Authtoken': authToken} ,responseType: 'application/vnd.apple.mpegurl'})
            axios.get(url, {headers: {'X-Radiko-Authtoken': authToken}})
                .then((response) => {
                    resolve(response.data.match(/http.*/)[0])
                })
                .catch((err) => {
                    reject(err)
                })
        });
    }

    async function download_mp3_file(chunkm3u8filepath, authToken, outputDir) {
        chunklisturls = await get_m3u8_info(`${chunkm3u8filepath}`);
        await new Promise((resolve, reject) => {
          chunklisturls.forEach(async function(element, index, array){
              child.exec(`wget -P "${outputDir}" "${element}" --header="X-Radiko-Authtoken: ${authToken}";sync`, (error, stdout, stdin) => {
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
        await new Promise((resolve, reject) => {
            child.exec(`cd "${outputDir}";find *.aac | sed 's/^/file /g' | sort > concatfiles.txt;ffmpeg -f concat -safe 0 -i "concatfiles.txt" "output.mp3"`, (error, stdout, stdin) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }


    async function get_channel_guide() {
        return new Promise((resolve, reject) => {
            axios.get("http://radiko.jp/v3/program/now/JP13.xml")
                .then((response) => {
                    resolve(convert.xml2json(response.data, {compact: true, spaces: 2}))
                })
                .catch((err) => {
                    reject(err)
                })
        });
    };
})(module);
