var express = require("express");
var queryString = require("querystring");
var util = require("./util.js");
var request = require("request");
var fs = require("fs");
const line = require("@line/bot-sdk");

var router = express.Router();
const bodyParser = require("body-parser");
var promise = require("promise");

var crypto = require("crypto");
var azure = require("azure-storage");

//const automl = require('@google-cloud/automl');
//const vision = require('@google-cloud/vision');

var sheet_url = process.env.SHEET_URL;

//sheet_url = "https://script.google.com/macros/s/AKfycbwMxqyWZNsNlBCLYZgcI5MjUKfpmft1xAz_S8cUFu2YIKpoYlXVHuM89td61BEhkMonNQ/exec"

const AZURE_STORAGE_ACCOUNT = "storageptgalluat";
const AZURE_STORAGE_ACCESS_KEY =
  "e/OKvBCINuoxgS8kq3g2ksR07o5TdX+9cLk2DhNXN1b8XInJIs6ezzLMdmGBeLPqPSeoDqWH/l9UwwQaYjUZ3Q==";
const AZURE_STORAGE_CONNECTION_STRING =
  "DefaultEndpointsProtocol=https;AccountName=storageptgalluat;AccountKey=e/OKvBCINuoxgS8kq3g2ksR07o5TdX+9cLk2DhNXN1b8XInJIs6ezzLMdmGBeLPqPSeoDqWH/l9UwwQaYjUZ3Q==;EndpointSuffix=core.windows.net";

var CHANNEL_SECRET = "";
var CHANNEL_ACCESS_TOKEN = "";
var CHANNEL_DIALOGLOW_URL = "";
var CHANNEL_FOLDER = "";

var u_svc = "TEL";

router.use(
  bodyParser.urlencoded({
    extended: true
  })
);

/* GET home page. */
router.all("/", function(req, res, next) {
  var bot_name = req.query["_bot_"];
  var req_key = req.query["_req_key_"];

  if (util.checkAuthKey(1, req_key) == "0") {
    res.status(401).send("Unauthorized");
    return;
  }

  console.log("================" + bot_name);

  CHANNEL_FOLDER = "hrbot/" + bot_name + "/";

  if (bot_name == "PTMAXBOT") {
    CHANNEL_SECRET = "ddb0cadb6e3f91e563ef7df7e17405a9";
    CHANNEL_ACCESS_TOKEN =
      "wcjDPSmcfZjlXlzW/U6Ia51ZxyTEHAxSWCAQLXKbnrqnHLXJKWbIyG1TlVrAE/Jete5s2HgQrwi0LKoaag7/+Cf3hB0GXKldFyt1Vp/EbPgCRK7MnWIUD01QTxFJIRSiH/8+RiVmSZllq3qyuljtFQdB04t89/1O/w1cDnyilFU=";
    CHANNEL_DIALOGLOW_URL =
      "https://bots.dialogflow.com/line/e422fb4e-c120-4a91-8b3e-b1210cb5b3a5/webhook";
    //https://dialogflow.cloud.google.com/v1/integrations/line/webhook/e35dc98d-63c4-4b59-aee1-9c0af0deb493
  } else if (bot_name == "HR-EMP-ID") {
    CHANNEL_SECRET = "88b46559bafa4a99bc363f2d460e862a";
    CHANNEL_ACCESS_TOKEN =
      "YfUk++RfoLHAy2hz3RQN3KQyoRgIFa2J/xjYyxHmvFYURPTPIZrqwG7YQhcUYJ4iVvWmRgblnXQVaxH8G6XYvyHzTSpYrSPhEesIHu/sviWnCnBLZ44/I0EMJwz91Mozl3LCUR4JJbAyZrPOz2dhbAdB04t89/1O/w1cDnyilFU=";
    CHANNEL_DIALOGLOW_URL =
      //  "https://bots.dialogflow.com/line/e422fb4e-c120-4a91-8b3e-b1210cb5b3a5/webhook";
      "https://dialogflow.cloud.google.com/v1/integrations/line/webhook/f3311c42-93b9-480a-a827-239f16da30b4";
  } else {
    res.status(200).send("No bot config");
  }

  console.log("\n\n\n Header is : ");
  console.log("\n" + JSON.stringify(req.headers, null, 4) + "\n");
  console.log("Body Is :\n" + JSON.stringify(req.body, null, 4) + "\n");

  var text = JSON.stringify(req.body);

  /////////////////////////////////////////////////////////////////////////////
  var req_intent = req.body["queryResult"]["action"];
  var req_src = req.body["session"];
  req_src = req_src.substr(1, 30);
  var req_user =
    req.body["originalDetectIntentRequest"]["payload"]["data"]["source"][
      "userId"
    ];
  var req_grp =
    req.body["originalDetectIntentRequest"]["payload"]["data"]["source"][
      "groupId"
    ];
  var req_text =
    req.body["originalDetectIntentRequest"]["payload"]["data"]["message"][
      "text"
    ];
  var reply_token =
    req.body["originalDetectIntentRequest"]["payload"]["data"]["replyToken"];

  var req_intent_match = req.body["queryResult"]["intent"]["displayName"];

  ///////////////////////////////////////////////////////////////////////

  let input_data = req.body["queryResult"]["parameters"];

  let v_type = "Inquiry";
  let v_id = "X";
  let v_img = "X";
  let v_comp = "X";
  let v_tel = "X";

  let line_res_msg = [];
  v_id = input_data["emp_id"];

  if (input_data.hasOwnProperty("com_code")) {
    v_type = "Add";
    v_comp = input_data["com_code"];
    v_img = input_data["pic_url"];
    v_tel = input_data["mob_no"];
/*
    line_res_msg.push(
      line_text("รหัสพนักงาน : " + v_id + "\n" + "บริษัท : " + v_comp)
    );
    */

      
    getEmp('HR-BOT',v_id).then(function(data) {

      res_txt = JSON.parse(data);
  
      line_res_msg.push(
        line_text( res_txt["results"][0]["EMP"])
      );
  
      console.log(res_txt["results"][0]["EMP"])
      console.log("==============================================================");
  
      line_res_msg.push(line_img(v_img));
  
      executeRow(v_id, v_comp, v_img, v_type, v_tel).then(function(inq_data) {
        line_res_msg.push(line_text(inq_data));
    
        reply(req_src, reply_token, line_res_msg);
    
        res.status(200).send();
      });
    
    })
    
  } else {
    v_type = "Inquiry";
    executeRow(v_id, v_comp, v_img, v_type, v_tel).then(function(inq_data) {
      line_res_msg.push(line_text(inq_data));
  
      reply(req_src, reply_token, line_res_msg);
  
      res.status(200).send();
    });

  }

});

function reply(req_src, reply_token, reply_msg) {
  console.log(
    "/************Send to Line ******************************************/"
  );
    channel_key =
      "Bearer YfUk++RfoLHAy2hz3RQN3KQyoRgIFa2J/xjYyxHmvFYURPTPIZrqwG7YQhcUYJ4iVvWmRgblnXQVaxH8G6XYvyHzTSpYrSPhEesIHu/sviWnCnBLZ44/I0EMJwz91Mozl3LCUR4JJbAyZrPOz2dhbAdB04t89/1O/w1cDnyilFU=";

  console.log("++++ " + channel_key);

  let headers = {
    "Content-Type": "application/json",
    Authorization: channel_key
  };

  let body = JSON.stringify({
    replyToken: reply_token,
    messages: reply_msg
  });

  //  console.log('Reply_msg =>' + reply_msg)

  request.post(
    {
      url: "https://api.line.me/v2/bot/message/reply",
      headers: headers,
      body: body
    },
    (err, res, body) => {
      console.log("status => " + body);
    }
  );

  console.log(
    "/************ End of Send to Line ******************************************/"
  );
}

function line_text(msg) {
  var reply_msg = {
    type: "text",
    text: msg
  };
  return reply_msg;
}

function line_img(msg) {
  var reply_msg = {
    type: "image",
    originalContentUrl: msg + "?strip=all&w=742&quality=100",
    previewImageUrl: msg + "?t=2027563652&w=620&h=430"
  };

  return reply_msg;
}

async function detectText(fileName) {
  // [START vision_text_detection]
  const vision = require("@google-cloud/vision");

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  var filePath = process.cwd() + "/" + fileName;

  /**
   * TODO(developer): Uncomment the following line before running the sample.
   */
  // const fileName = 'Local image file, e.g. /path/to/image.png';

  // Performs text detection on the local file
  const [result] = await client.textDetection(filePath);
  const detections = result.textAnnotations;
  console.log("Text:");
  //detections.forEach(text => console.log(text.description));
  // [END vision_text_detection]
  console.log(detections[0].description);

  fs.unlink(filePath, err => {
    if (err) {
      console.error("Error : " + err);
      return;
    }
  });

  return detections[0].description;

  //console.log(detections)
}

async function executeRow(emp_in, comp_in, image_in, type_in, tel_in) {
  return new promise(function(fulfill, reject) {
    let headers = {};
    var request1 = require("request");
    console.log(emp_in);
    console.log(comp_in);
    console.log(image_in);

    request1.get(
      {
        url:
          sheet_url +
          "?data1=" +
          emp_in +
          "&data2=" +
          comp_in +
          "&data3=" +
          image_in +
          "&type=" +
          type_in +
          "&data4=" +
          tel_in
      },
      (err, res, body) => {
        console.log(555);
        console.log("status => " + body);
        fulfill(body);
      }
    );

    console.log(
      "/************ End of Send to Line ******************************************/"
    );
  });
}

async function getEmp(req_user, emp_in) {
  return new promise(function(fulfill, reject) {
    var uData = util.encrypt3DES(
      JSON.stringify({
        u_id: req_user,
        key1: emp_in
      }),
      '"pme/yriuqni"'
    );

    uData = Buffer.from(uData).toString("hex");
//    uData = { data: uData };

    let body = "data="+uData
  

    let headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": Buffer.byteLength(body)
  };
  
  
    request.post(
      {
        url: "http://asv-it-bot03-uat.azurewebsites.net/inquiry/empnew?BOT=Y",
        headers: headers,
        body: body
      },
      (err, res, body) => {
        console.log("status => " + body);
        fulfill ( body)
      }
    );
  

  });
}

module.exports = router;
