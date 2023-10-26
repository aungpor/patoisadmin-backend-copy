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

var code_in = "";

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
router.all("/", isAuthenticated, function (req, res, next) {
  var shop_in = req.body["shop_in"];
  var name_in = req.body["name_in"];
  var new_name_in = req.body["new_shop_name"];
  var update_in = req.body["update_flag"];
  var start_in = req.body["start_in"];
  var end_in = req.body["end_in"];
  var reviewflag_in = req.body["detail_flag"];

  code_in = req.body["verifycode"];

  var shop_txt = "";
  var name_txt = "";

  if (shop_in != "" && shop_in != undefined) {
    shop_txt = ' value="' + shop_in + '"';
  }

  if (name_in != "" && name_in != undefined) {
    name_txt = ' value="' + name_in + '"';
  }

  if (code_in != util.verify()) {
    res.send("Unauthorized");
    return;
  }

  var pform =
    tablequery.getPageHeader() +
    "<body> " +
    '<table><tr><td><form method="post" action="/index-main"><input type="submit" value="<--- Back to menu"> <input type="hidden" name="verifycode" value="' +
    code_in +
    '"></form></td></tr><tr><td width=400>Search ShopID <form method="post" target=inquiry_shop action="/M1-Br2rvh55iHFl6dJ6Ph7j1cli68pmR8t01CMu4BzstpS6KuDd8AIgwjjdQqpRMpbC" ><input type=text name="shop_in" ' +
    shop_txt +
    '> <input type="checkbox" name="detail_flag">with review <input type="submit">  <input type="hidden" name="verifycode" value="' +
    code_in +
    '"></form> </td> <td width=400>' +
    'Search ShopName <form method="post" action="/M1-Br2rvh55iHFl6dJ6Ph7j1cli68pmR8t01CMu4BzstpS6KuDd8AIgwjjdQqpRMpbC" ><input type=text name="name_in" ' +
    name_txt +
    '><input type="checkbox" name="detail_flag">with review <input type="submit"> <input type="hidden" name="verifycode" value="' +
    code_in +
    '"></form> </td><td>' +
    'Search Shop Range <form method="post" action="/M1-Br2rvh55iHFl6dJ6Ph7j1cli68pmR8t01CMu4BzstpS6KuDd8AIgwjjdQqpRMpbC" ><input type=text name="start_in" size=7>' +
    '<input type=text name="end_in" size=7> <input type="checkbox" name="detail_flag">with review<input type="submit"> <input type="hidden" name="verifycode" value="' +
    code_in +
    '"></form> </td></tr>' +
    "<tr></tr>" +
    "</table>";

  if (update_in == "X" && update_in != undefined) {
    console.log("update");

    updateShop(shop_in, new_name_in).then(function (data) {
      getshop(new_name_in, reviewflag_in).then(function (data1) {
        res.send(pform + data1);
      });
    });
  } else if (shop_in != "" && shop_in != undefined) {
    getTable(shop_in, reviewflag_in).then(function (data) {
      res.send(pform + data);
    });
  } else if (name_in != "" && name_in != undefined) {
    getshop(name_in, reviewflag_in).then(function (data) {
      res.send(pform + data);
    });
  } else if (start_in != "" && start_in != undefined) {
    if (end_in != "" && end_in != undefined) {
    } else {
      end_in = start_in * 1 + 30;
    }
    getshopRange(start_in, end_in, reviewflag_in).then(function (data) {
      res.send(pform + data);
    });
  } else {
    res.send(pform);
  }
});

async function getshop(name_in, review_flag_in) {
  var input_param = [];
  input_param.push({ name: "name_in", type: "C", value: "%" + name_in + "%" });
  input_param.push({ name: "xxx", type: "C", value: "%" + name_in + "%" });
  input_param.push({ name: "review_flag", type: "C", value: review_flag_in });
  input_param.push({ name: "update_shop", type: "C", value: "Y" });
  input_param.push({ name: "export_in", type: "C", value: "Y" });

  let query_result = await tablequery.getReview(
    code_in,
    "ReviewByShopName",
    input_param
  );

  return query_result;
}

async function getshopRange(start_in, end_in, review_flag_in) {
  var input_param = [];
  input_param.push({ name: "start_in", type: "C", value: start_in });
  input_param.push({ name: "end_in", type: "C", value: end_in });
  input_param.push({ name: "review_flag", type: "C", value: review_flag_in });
  input_param.push({ name: "update_shop", type: "C", value: "Y" });
  input_param.push({ name: "export_in", type: "C", value: "Y" });

  let query_result = await tablequery.getReview(
    code_in,
    "ReviewByShopRange",
    input_param
  );

  return query_result;
}

async function getTable(shop_in, review_flag_in) {
  var input_param = [];
  input_param.push({ name: "shop_in", type: "C", value: shop_in });
  input_param.push({ name: "xxx1", type: "C", value: shop_in });
  input_param.push({ name: "review_flag", type: "C", value: review_flag_in });
  input_param.push({ name: "xxx3", type: "C", value: shop_in });
  input_param.push({ name: "export_in", type: "C", value: "Y" });

  let query_result = "";
  query_result = await tablequery.getReview(
    code_in,
    "ReviewByShopID",
    input_param
  );
  //console.log(query_result);
  return query_result;
}

async function updateShop(shop_in, name_in) {
  //  console.log(shop_in);
  //  console.log(name_in);

  var input_param = [];
  input_param.push({ name: "shop_in", type: "C", value: shop_in });
  input_param.push({ name: "name_in", type: "C", value: name_in });

  var sql =
    "update wongnok_shop set shopname=@name_in , interface_from ='webadmin' where shop_id = @shop_in  ";

  //  console.log(sql);
  let data = "";

  data = await util.querynewDB2(config_in, sql, input_param);
  sql_result = JSON.parse(data);

  sql_result = sql_result["results"];

  let html = "";
  html = html + "<table border=1><tr><td>" + data;

  html = html + "</tr></td></table>";

  return html;
}

module.exports = router;
