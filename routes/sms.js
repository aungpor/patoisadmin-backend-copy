var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
var queryString = require("querystring");
var util = require("./util.js");
var promise = require("promise");
const multer = require("multer");
var request = require("request");

var fetch = require("../fetch");

var { GRAPH_ME_ENDPOINT } = require("../authConfig");

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

/* GET home page. */
router.all("/batchapi-a2zmkq15y3op3fvqvfeiu5oj4zxe2c1e25o1nc2yud4xjr88zaxi3dmek3wwdkxd", function (req, res, next) {

    var config_in = {
      userName: process.env.SQL_USER, // update me
      password: process.env.SQL_PASSWORD, // update me
      server: process.env.SQL_SERVER, // update me
      options: {
        database: process.env.SQL_DATABASE, //update me
        encrypt: process.env.SQL_ENCRYPT,
      },
    };
    let input_param = [];

    let sql = "select * from batch_crm_trans where status = 0  ";

    util.querynewDB2(config_in, sql, input_param).then(function (data) {
      let result1 = JSON.parse(data);
      result1 = result1["results"];

      for (let ind = 0; ind < result1.length; ind++) {
        let data_row = result1[ind];
        CallAPI(result1[ind]).then(function (data_crm) {
          let res_crm = JSON.parse(data_crm);
          updateDB(
            data_row["trans_id"],
            res_crm["ResponseCode"],
            res_crm["data"]["STATUS"]["RESPONSE_CODE"],
            JSON.stringify(res_crm["data"]["DATA"])
          );
          //          console.log(data_row["referenceid"], data_crm);
        });
      }
      res.send("Process CRM " + result1.length + " records");
    });
})

router.all("/", function (req, res, next) {
  var pform = "";
  pform =
    "<html><title>" +
    process.env.APP_ENVIRONMENT +
    " - " +
    util.getVersion() +
    '</title><head><script language="javascript"> function show(id) { if  (confirm("ยืนยันการลบ!") == true) ' +
    ' { window.open("https://prd-web-admin-patois.azurewebsites.net/deletereview?review_in=" + id) ;} } </script></head><body>' +
    "<table>" +
    ' <tr> <td>Mobile No <form method="post" action="/sms"><input type="hidden" name="check" value="X"><input type="text" name="otp"> </td><td><input type="submit" value="Check"> </form> </td></tr> ' +
    "</table>";

    var config_in = {
      userName: process.env.SQL_USER, // update me
      password: process.env.SQL_PASSWORD, // update me
      server: process.env.SQL_SERVER, // update me
      options: {
        database: process.env.SQL_DATABASE, //update me
        encrypt: process.env.SQL_ENCRYPT,
      },
    };
    
    var otp = '%'
    if ( req.body.otp ) { 
        otp = '%'  +req.body.otp + '%'
    }

    let input_param = [];
    input_param.push({
      name: "otp",
      type: "C",
      value: otp ,
    });

    let sql =
      "select top 30 dateadd(hour,7, otp_send_at) send_at , otp_to , otp_text  from patois_otp where otp_to like @otp and otp_send_at > dateadd(d,-1,getdate()) order by otp_send_at desc ";

      //console.log(sql) 

    util.querynewDB2(config_in, sql, input_param).then(function (data) {
      let result = JSON.parse(data);
      res.send(pform + jsonToTable(result["results"]));
    });
});



function jsonToTable(json) {
  let table = "<table border=1>";

  for (let ind = 0; ind < json.length; ind++) {
    table += "<tr>";
    table += "<td>" + ind + "</td>";
    table += "<td width=200>" + json[ind]["send_at"] + "</td>";
    table += "<td width=120>" + json[ind]["otp_to"] + "</td>";
    table += "<td width=300>" + json[ind]["otp_text"] + "</td>";
    table += "</tr>";
  }

  table += "</table>";

  return table;
}

async function CallAPI(data_in) {
  return new promise(function (fulfill, reject) {
    let headers = {
      "Content-Type": "application/json",
      token:
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxNDgyNCIsImVtYWlsIjoiYmVlaGFydUBob3RtYWlsLmNvbSIsInRlbCI6IiIsIm5hbWUiOiJCYW5jaGEgV2FubmFzb3BhciIsImdyb3Vwc2lkIjoyLCJpc0JpbmRNYXhjYXJkIjpmYWxzZSwicGF0b2lzTWF4Y2FyZElkIjpudWxsLCJsaW5lSWQiOm51bGwsImlhdCI6MTY3NjAyODA3NywiZXhwIjoxNjc4NjIwMDc3fQ.eCK3hpMl2ddrztFQ2We5A6MApaT3cK4dwX_01np_pF0",
    };

    let body = JSON.stringify({
      MID: "396221113400001",
      TID: "Patois99",
      BATCH_ID: util.getDateTime("YYYYMMDD"),
      STAND_ID: "24",
      PRODUCT_CODE: "4101001000002",
      PRODUCT_PRICE: 1,
      userId: data_in["user_id"],
      PRODUCT_QUAN: data_in["product_quan"],
      CARD_NO: data_in["card_no"],
      TIME: "",
      referenceId: data_in["referenceid"],
      referenceType: data_in["referencetype"],
      promosCode: data_in["promoscode"],
    });
    console.log(body);
    request.post(
      {
        url: process.env.POINT_URL,
        headers: headers,
        body: body,
      },
      (err, res, body) => {
        console.log("status => " + res.statusCode + "\n" + body);

        fulfill(body);
      }
    );
  });
}

module.exports = router;
