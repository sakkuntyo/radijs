// general settings
const axios = require('axios').default;

// xml parser settings 
const { XMLParser, XMLBuilder, XMLValidator } = require('fast-xml-parser');
const options = {
	    ignoreAttributes: false,
	    format: true,
};

const parser = new XMLParser(options);

(function(module) {
    'use strict';

    module.exports.get_authtoken = get_authtoken;
    module.exports.get_bangumi_uri = get_bangumi_uri;

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
})(module);
