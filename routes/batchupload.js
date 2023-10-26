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

router.all("/", isAuthenticated, function (req, res, next) {
  var pform = "";
  pform =
    "<html><title>" +
    process.env.APP_ENVIRONMENT +
    " - " +
    util.getVersion() +
    '</title><head><script language="javascript"> function show(id) { if  (confirm("ยืนยันการลบ!") == true) ' +
    ' { window.open("https://prd-web-admin-patois.azurewebsites.net/deletereview?review_in=" + id) ;} } </script></head><body>' +
    "<table>" +
    ' <tr> <td> <form method="post" enctype="multipart/form-data" action="/batchupload"><input type="file" name="uploadfile"></td><td> <input type="submit" value="upload"> </form> </td></tr> ' +
    "<tr></tr>" +
    ' <tr> <td>Check uploadfile <form method="post" action="/batchupload"><input type="hidden" name="check" value="X"><input type="text" name="checkfile"> </td><td><input type="submit" value="Check"> </form> </td></tr> ' +
    "<tr></tr>" +
    ' <tr> <td>Process point to CRM <form method="post" action="/batchupload"><input type="hidden" name="crm" value="X"></td><td><input type="submit" value="Process to CRM"> </form> </td></tr> ' +
    "<tr></tr>" +
    "</table>";

  if (req.files) {
    console.log(req.files.uploadfile);
    let uploadfile = req.files.uploadfile;

    //Use the mv() method to place the file in the upload directory (i.e. "uploads")
    let fullpath = "./upload/" + uploadfile.name;
    uploadfile.mv(fullpath).then(function (data) {
      var XLSX = require("xlsx");
      var workbook = XLSX.readFile(fullpath);
      var sheet_name_list = workbook.SheetNames;
      var xlData = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheet_name_list[0]]
      );
      //    console.log(JSON.stringify(xlData, null, 4));
      pform =
        pform + uploadfile.name + " is uploading , Record : " + xlData.length;

      let count = 0;
      processRequest(xlData, uploadfile.name).then(function (data) {
        res.send(pform);
      });
    });
  } else if (req.body.check) {
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
    input_param.push({
      name: "filename",
      type: "C",
      value: req.body.checkfile,
    });

    let sql =
      "select * from batch_crm_trans where filename = @filename order by trans_id desc ";

    util.querynewDB2(config_in, sql, input_param).then(function (data) {
      let result = JSON.parse(data);
      res.send(pform + jsonToTable(result["results"]));
    });
  } else if (req.body.crm) {
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
      res.send(pform + "Process CRM " + result1.length + " records");
    });
  } else {
    res.send(pform);
  }
});

async function processRequest(xlData, filename) {
  for (let ind = 0; ind < xlData.length; ind++) {
    //    console.log(ind, xlData[ind]);
    insertDB(xlData[ind], filename);
  }
  return "x";
}

async function insertDB(xlRow, filename) {
  return new promise(function (fulfill, reject) {
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
    input_param.push({
      name: "uid",
      type: "C",
      value: xlRow["userid"],
    });
    input_param.push({
      name: "quan",
      type: "C",
      value: xlRow["point"],
    });
    input_param.push({
      name: "card",
      type: "C",
      value: xlRow["cardno"],
    });
    input_param.push({
      name: "time",
      type: "C",
      value: xlRow["userid"],
    });
    input_param.push({
      name: "refid",
      type: "C",
      value: xlRow["referenceid"],
    });
    input_param.push({
      name: "reftype",
      type: "C",
      value: xlRow["referencetype"],
    });
    input_param.push({
      name: "prom",
      type: "C",
      value: xlRow["promocode"],
    });
    input_param.push({
      name: "remark",
      type: "C",
      value: xlRow["remark"],
    });
    input_param.push({
      name: "by",
      type: "C",
      value: process.env.username,
    });
    input_param.push({
      name: "file",
      type: "C",
      value: filename,
    });
    let sql =
      "insert into batch_crm_trans(user_id,product_quan,card_no,time,referenceid , referencetype,promoscode,remark,created_by,filename) " +
      " values(@uid , @quan , @card , @time , @refid , @reftype , @prom , @remark , @by ,@file) ";

    util.querynewDB2(config_in, sql, input_param).then(function (data) {
      //      console.log(data);
      fulfill(data);
    });
  });
}

async function updateDB(tid, status_msg, result_code, result_msg) {
  return new promise(function (fulfill, reject) {
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
    input_param.push({
      name: "tid",
      type: "C",
      value: tid,
    });

    input_param.push({
      name: "code",
      type: "C",
      value: result_code,
    });
    input_param.push({
      name: "msg",
      type: "C",
      value: result_msg,
    });
    input_param.push({
      name: "status",
      type: "C",
      value: status_msg,
    });
    let sql =
      "update batch_crm_trans set result_code=@code , result_msg=@msg , status=@status where trans_id = @tid  ";

    util.querynewDB2(config_in, sql, input_param).then(function (data) {
      //console.log(data);
      fulfill(data);
    });
  });
}

function jsonToTable(json) {
  let table = "<table border=1>";

  for (let ind = 0; ind < json.length; ind++) {
    table += "<tr>";
    table += "<td>" + ind + "</td>";
    table += "<td>" + json[ind]["filename"] + "</td>";
    table += "<td>" + json[ind]["user_id"] + "</td>";
    table += "<td>" + json[ind]["product_quan"] + "</td>";
    table += "<td>" + json[ind]["card_no"] + "</td>";
    table += "<td>" + json[ind]["referenceid"] + "</td>";
    table += "<td>" + json[ind]["referencetype"] + "</td>";
    table += "<td>" + json[ind]["promoscode"] + "</td>";
    table += "<td>" + json[ind]["remark"] + "</td>";
    table += "<td>" + json[ind]["created_by"] + "</td>";
    table += "<td>" + json[ind]["status"] + "</td>";
    table += "<td>" + json[ind]["result_code"] + "</td>";
    table += "<td>" + json[ind]["result_msg"] + "</td>";
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
