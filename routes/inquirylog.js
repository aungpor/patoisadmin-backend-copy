var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
var queryString = require("querystring");
var util = require("./util.js");
var promise = require("promise");
var tablequery = require("./tablequery");
var fetch = require("../fetch");
var fs = require("fs");
var promise = require("promise");

const lineReader = require("line-reader");

const {
  StorageSharedKeyCredential,
  BlobServiceClient,
} = require("@azure/storage-blob");

var { GRAPH_ME_ENDPOINT } = require("../authConfig");

const AZURE_STORAGE_ACCOUNT = "patiosapplicationlog";
const AZURE_STORAGE_ACCESS_KEY =
  "pASr6EShtij7amC6S4545Q/BhMEEnUxGrdF9/9GfT/21+RhSzd6m9d4B9Y2l/FTqDBICmq9wXtrF+AStap6RqA==";
const AZURE_STORAGE_CONNECTION_STRING =
  "DefaultEndpointsProtocol=https;AccountName=patiosapplicationlog;AccountKey=pASr6EShtij7amC6S4545Q/BhMEEnUxGrdF9/9GfT/21+RhSzd6m9d4B9Y2l/FTqDBICmq9wXtrF+AStap6RqA==;EndpointSuffix=core.windows.net";

///////////////////////////////////////////
const sharedKeyCredential = new StorageSharedKeyCredential(
  AZURE_STORAGE_ACCOUNT,
  AZURE_STORAGE_ACCESS_KEY
);
const baseUrl = "https://patiosapplicationlog.blob.core.windows.net";
const containerName = "prdlog";

const blobServiceClient = new BlobServiceClient(baseUrl, sharedKeyCredential);

////////////////////////////////////////////

// custom middleware to check auth state
function isAuthenticated(req, res, next) {
  //  console.log("\n" + JSON.stringify(req.session, null, 4) + "\n");
  if (!req.session.isAuthenticated) {
    return res.redirect("/auth/signin"); // redirect to sign-in route
  }

  next();
}

router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

var config_in = {
  userName: process.env.SQL_USER, // update me
  password: process.env.SQL_PASSWORD, // update me
  server: process.env.SQL_SERVER, // update me
  options: {
    database: process.env.SQL_DATABASE, //update me
    encrypt: process.env.SQL_ENCRYPT,
  },
};

var code_in = "";
var start_in = "";
var hr_in = "";
var export_flag = "";

/* GET home page. */
router.all("/", isAuthenticated, function (req, res, next) {
  //router.all("/", function (req, res, next) {
  var filter_in = "";
  var filter_json = "";
  start_in = req.body["START"];
  hr_in = req.body["HR"];

  if (start_in == undefined) {
    start_in = "";
  }
  if (hr_in == undefined) {
    hr_in = "";
  }
  code_in = req.body["verifycode"];

  try {
    filter_in = req.body["filter"];
    filter_json = JSON.parse(filter_in);
  } catch (e) {
    filter_in =
      '{"INCLUDE":["message"] , "EXCLUDE":["/pdpa","/announcement/banner", "/activity/shopsHit"]}';
    filter_json = JSON.parse(filter_in);
  }

  console.log(filter_in);
  console.log(filter_json);

  if (code_in != util.verify()) {
    res.send("Unauthorized");
    return;
  }

  var pform =
    tablequery.getPageHeader() +
    "<body>" +
    '<table><tr><td><form method="post" action="/index-main"><input type="submit" value="<--- Back to menu"> <input type="hidden" name="verifycode" value="' +
    code_in +
    '"></form></td></tr>' +
    '<form method="post" action="/M7-jZmGczTvyIEfqNIpxW8jATaBYreVwvbnEyMv2TSvHnv" > <table><tr><td >Log Date (YYYY-MM-DD) <input type=text name="START" size=10 value="' +
    start_in +
    '"> ' +
    ' <input type="hidden" name="verifycode" value="' +
    code_in +
    '"> </td><td>Hour<input type=text name="HR" size=2 value="' +
    hr_in +
    '"></td> <td>Filter text <textarea id="filter" name="filter" rows="5" cols="50" >' +
    filter_in +
    "</textarea>  </td>" +
    '<td><input type="submit"></td></tr></table></form> ';

  if (start_in != "") {
    main123(filter_json).then(function (data) {
      //    var logJson = JSON.parse(data);
      //    console.log("--> " + logJson.length);
      //    res.send(data);
      xxx = JSON.stringify(data);
      console.log("----------------------> " + data.length);

      for (ind = 0; ind < data.length; ind++) {
        //console.log(data[ind]["message"]["a_type"]);
      }

      res.send(pform + printHTML(data));
    });
  } else {
    res.send(pform);
  }

  //  res.send("1");
});

async function main123(filter_in) {
  // Create container client
  const containerClient = await blobServiceClient.getContainerClient(
    containerName
  );

  // do something with containerClient...
  let i = 1;

  const listOptions = {
    includeMetadata: true,
    includeSnapshots: false,
    includeTags: true,
    includeVersions: false,
    prefix: start_in + "/api_patois." + start_in + "-" + hr_in,
  };
  // List blobs in container
  var logtxt;
  var tempBlockBlobClient;
  var blobname;
  var blobclient;
  var count_rec = 0;
  var tmplog;
  var result_log = [];

  console.log(JSON.stringify(listOptions));
  for await (const blob of containerClient.listBlobsFlat(listOptions)) {
    blobname = blob.name;
    console.log(`Blob ${i++}: ${blob.name}`);
    tempBlockBlobClient = containerClient.getBlockBlobClient(blob.name);
    /*
    console.log(
      "\n\tname: " + blob.name + "\n\tURL: " + tempBlockBlobClient.url + "\n"
    );
    */
    const downloadBlockBlobResponse = await tempBlockBlobClient.download(0);
    console.log("\n\nDownloaded blob content..." + blobname);
    logtxt = await streamToText(downloadBlockBlobResponse.readableStreamBody);
    blobClient = await containerClient.getBlobClient(blobname);
    await blobClient.downloadToFile("./tmpfile");

    tmplog = await readline(filter_in, "./tmpfile");
    console.log(blobname + " : " + tmplog.length + " records");
    count_rec = count_rec + tmplog.length;

    for (ind2 = 0; ind2 < tmplog.length; ind2++) {
      result_log.push(tmplog[ind2]);
    }
    if (count_rec > 1000) break;
  }

  //.DownloadToFileAsync(localPath,FileMode.Create);

  console.log("+++++++++++++++++++++++ Record : " + count_rec);

  return result_log;
}

function printHTML(jsonIn) {
  var html = "<br><table border=1 >";

  for (ind = 0; ind < jsonIn.length; ind++) {
    let req_key = jsonIn[ind]["message"]["f_mappingKey"];
    let res_key = jsonIn[ind]["message"]["d_mappingKey"];
    let usrID = jsonIn[ind]["message"]["e_userId"];
    if (usrID == undefined) usrID = "";
    let ip = jsonIn[ind]["message"]["ip_address"];
    let log_ts = jsonIn[ind]["timestamp"];

    if (req_key == undefined) {
      req_key = "";
    }
    if (res_key == undefined) {
      res_key = "";
    }

    html =
      html +
      "<tr ><td>" +
      log_ts +
      "</td><td>" +
      usrID +
      "</td><td>" +
      ip +
      "</td><td>" +
      req_key +
      "</td><td>" +
      res_key +
      "</td><td width=600>" +
      JSON.stringify(jsonIn[ind]) +
      "</td></tr>";
  }

  html = html + "</table>";

  return html;
}

async function readline(filter_in, file_in) {
  return new promise(function (fulfill, reject) {
    var loglist = [];
    var lastline = "";
    var txt_INCLUDE = filter_in["INCLUDE"];
    var txt_EXCLUDE = filter_in["EXCLUDE"];

    console.log("Include => " + txt_INCLUDE);
    console.log("Exclude => " + txt_EXCLUDE);

    lineReader.eachLine(file_in, function (line, last) {
      //  console.log(`Line from file: ${line}`);

      let tmp = JSON.parse(line);

      let EXCLUDE_flag = "N";
      let INCLUDE_flag = "Y";

      for (inx = 0; inx < txt_EXCLUDE.length; inx++) {
        if (line.indexOf(txt_EXCLUDE[inx]) > 0) {
          EXCLUDE_flag = "Y";
        }
      }

      if (EXCLUDE_flag == "N") {
        for (inx = 0; inx < txt_INCLUDE.length; inx++) {
          if (line.indexOf(txt_INCLUDE[inx]) < 0) {
            INCLUDE_flag = "N";
          }
        }
      }

      if (EXCLUDE_flag == "Y") {
        console.log("Exclude");
      } else if (INCLUDE_flag == "Y") {
        loglist.push(tmp);
      }

      lastline = line;
      if (last) {
        console.log("Last line printed.");
        const used = process.memoryUsage().heapUsed / 1024 / 1024;
        console.log(
          `The script uses approximately ${Math.round(used * 100) / 100} MB`
        );
        /*
        console.log(
          "\n" + JSON.stringify(JSON.parse(lastline), null, 4) + "\n"
        );
*/
        fs.unlinkSync(file_in);
        fulfill(loglist);
      }
    });
  });
}

async function streamToText(readable) {
  readable.setEncoding("utf8");
  let data = "";
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}

module.exports = router;
