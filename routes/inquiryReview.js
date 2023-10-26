var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
var queryString = require("querystring");
var util = require("./util.js");
var promise = require("promise");
var tablequery = require("./tablequery");
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

var code_in = "";

var export_flag = "";

/* GET home page. */
router.all("/", isAuthenticated, function (req, res, next) {
  var start_in = req.body["START"];
  var end_in = req.body["END"];
  var quality_in = req.body["quality"];
  code_in = req.body["verifycode"];

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
    '<form method="post" action="/M3-zqyYCM08otSYjvuKJ3qDNLxr9UFw9dguefDn1IIeErpQEAd5QQZ8MV06kx2jINTk" > <table><tr><td >Start Date (YYYYMMDD) <input type=text name="START" size=10> ' +
    ' <input type="hidden" name="verifycode" value="' +
    code_in +
    '"> </td><td>End Date (YYYYMMDD) <input type=text name="END" size=10>  </td>' +
    '<td>Quality<select name=quality>  <option value="All" selected>All</option> <option value="Good Quality">Good Quality</option><option value="Qualify">Qualify</option> <option value="No Qualify">No Qualify</option></select>' +
    ' <input type="checkbox" name="export_flag">Download XLS       <input type="submit"></td></tr></table></form> ';

  export_flag = req.body["export_flag"];

  if (start_in != "" && start_in != undefined) {
    if (end_in != "" && end_in != undefined) {
      //
    } else {
      end_in = start_in;
    }

    var input_param = [];
    input_param.push({ name: "start_in", type: "C", value: start_in });
    input_param.push({ name: "end_in", type: "C", value: end_in });
    input_param.push({ name: "quality_in", type: "C", value: quality_in });
    input_param.push({ name: "xxx", type: "C", value: "Y" });
    input_param.push({ name: "export_in", type: "C", value: export_flag });

    getTable(input_param).then(function (data) {
      if (export_flag == "on") {
        //        console.log(data);
        var stream = require("stream");
        var readStream = new stream.PassThrough();
        // create stream
        readStream.end(Buffer.from(data));
        // Send your response
        res.setHeader(
          "Content-Disposition",
          "attachment; filename=" + start_in + ".xls"
        ); // set filename for client download process
        res.setHeader("Content-Transfer-Encoding", "binary");
        res.setHeader("Content-Type", "application/octet-stream");
        readStream.pipe(res);
      } else {
        res.send(pform + data + "</body></html>");
      }
    });
  } else {
    res.send(pform);
  }
});

async function getTable(input_param) {
  let html = "";

  html = tablequery.getReview(code_in, "ReviewByDate", input_param);

  return html;
}

module.exports = router;
