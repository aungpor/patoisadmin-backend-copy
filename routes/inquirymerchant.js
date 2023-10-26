var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
var queryString = require("querystring");
var util = require("./util.js");
var promise = require("promise");
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

var code_in;
/* GET home page. */
router.all("/", isAuthenticated, function (req, res, next) {
  var shop_in = req.body["shop_in"];
  var name_in = req.body["name_in"];
  var new_name_in = req.body["new_shop_name"];
  var update_in = req.body["update_flag"];
  var lat_in = req.body["new_lat_in"];
  var long_in = req.body["new_long_in"];
  var loc_name_in = req.body["new_loc_name"];

  var shop_txt = "";
  var name_txt = "";

  code_in = req.body["verifycode"];

  if (code_in != util.verify()) {
    res.send("Unauthorized");
    return;
  }

  if (shop_in != "" && shop_in != undefined) {
    shop_txt = ' value="' + shop_in + '"';
  }

  if (name_in != "" && name_in != undefined) {
    name_txt = ' value="' + name_in + '"';
  }

  var pform =
    "<html><title>" +
    util.getVersion() +
    '</title><head><script language="javascript"> function show(id) { if  (confirm("ยืนยันการลบ!") == true) ' +
    ' { window.open("https://prd-web-admin-patois.azurewebsites.net/deletereview?review_in=" + id) ;} } </script></head><body>' +
    '<table><tr><td><form method="post" action="/index-main"><input type="submit" value="<--- Back to menu"> <input type="hidden" name="verifycode" value="' +
    code_in +
    '"></form></td></tr><tr> <td>' +
    'Search ShopName <form method="post" action="/M4-KhRT7VLkJlSWrzXEdsRzTrUIsax95BF6id5TpnT7m4LuTG0KirKx0ckrqjjM9D1E" ><input type=text name="name_in" ' +
    name_txt +
    '> <input type="submit"> <input type="hidden" name="verifycode" value="' +
    code_in +
    '"></form> </td></tr>' +
    "<tr></tr>" +
    "</table>";

  if (update_in == "X" && update_in != undefined) {
    console.log("update");

    updateShop(shop_in, new_name_in, lat_in, long_in, loc_name_in).then(
      function (data) {
        getshop(new_name_in).then(function (data1) {
          res.send(pform + data1);
        });
      }
    );
  } else if (shop_in != "" && shop_in != undefined) {
    getTable(shop_in).then(function (data) {
      res.send(pform + data);
    });
  } else if (name_in != "" && name_in != undefined) {
    getshop(name_in).then(function (data) {
      res.send(pform + data);
    });
  } else {
    res.send(pform);
  }
});

async function getshop(name_in) {
  var tmp_txt = name_in;

  var input_param = [];
  input_param.push({
    name: "name_in",
    type: "C",
    value: "%" + tmp_txt.toUpperCase() + "%",
  });
  var html = "";

  var sql =
    "  select merchant_id  , merchant_shop_name , l.location_id , l.latitude , l.longitude , l.location_name " +
    " from patois_merchant m left join wongnok_location l  on m.merchant_location_id = l.location_id  " +
    " where merchant_shop_name like @name_in order by merchant_shop_name ";

  //console.log(sql);

  data = await util.querynewDB2(config_in, sql, input_param);
  sql_result = JSON.parse(data);

  sql_result = sql_result["results"];
  html = html + "<table border=0>";
  for (ind = 0; ind < sql_result.length; ind++) {
    img_tag = "";

    html =
      html +
      "<tr> <td>" +
      '<form method="post" action="/M4-KhRT7VLkJlSWrzXEdsRzTrUIsax95BF6id5TpnT7m4LuTG0KirKx0ckrqjjM9D1E"><input type=hidden name="update_flag" value="X"> ' +
      "</td><td>MID:" +
      '<input type=hidden name="shop_in" readonly=true value="' +
      sql_result[ind]["merchant_id"] +
      '">' +
      sql_result[ind]["merchant_id"] +
      "</td><td >" +
      '<input type=text name="new_shop_name" value="' +
      sql_result[ind]["merchant_shop_name"] +
      '" size=40>' +
      "</td><td >" +
      '<input type=text name="new_lat_in" value="' +
      sql_result[ind]["latitude"] +
      '" size=15 >' +
      "</td><td >" +
      '<input type=text name="new_long_in" value="' +
      sql_result[ind]["longitude"] +
      '" size=15 >' +
      "</td><td >" +
      '<input type=text name="new_loc_name" value="' +
      sql_result[ind]["location_name"] +
      '" size=50 >' +
      "</td><td >" +
      '<input type="submit" value="update"> <input type="hidden" name="verifycode" value="' +
      code_in +
      '">' +
      "</td></form></tr>";
  }
  html = html + "</table>";
  //console.log(html);
  return html;
}

async function getTable(shop_in) {
  var input_param = [];
  input_param.push({
    name: "shop_id",
    type: "C",
    value: shop_in.toUpperCase(),
  });

  var shop_sql = "select shopName from wongnok_shop where shop_id = @shop_id ";
  var shop_result = await util.querynewDB2(config_in, shop_sql, input_param);
  shop_result = JSON.parse(shop_result);
  let html =
    "<font size =20><b>" +
    shop_result["results"][0]["shopName"] +
    "</b></font><br><br>";

  var sql =
    "select  r.user_id , r.images_id , post_review_id, shop_id , review , dbo.split_image(filename)  as img " +
    " from  wongnok_post_review r left join patois_images i " +
    " on i.images_id = r.images_id  " +
    " where  shop_id = @shop_id  and active = 1 order by created_at desc ";

  console.log(sql);

  data = await util.querynewDB2(config_in, sql, input_param);
  sql_result = JSON.parse(data);

  let img_tag = "";
  sql_result = sql_result["results"];
  html = html + "<table border=1>";
  for (ind = 0; ind < sql_result.length; ind++) {
    img_tag = "";
    if (sql_result[ind]["post_review_id"] == sql_result[ind]["shop_id"]) {
    } else if (sql_result[ind]["images_id"] === null) {
    } else {
      img_tag =
        '<img src="https://ptg-test-php01-uat.azurewebsites.net/del.jpg" width=20 onclick="show(' +
        sql_result[ind]["post_review_id"] +
        '); "> ';
    }

    html =
      html +
      "<tr><td>" +
      img_tag +
      "</td><td>ReviewID:" +
      sql_result[ind]["post_review_id"] +
      "</td><td>" +
      sql_result[ind]["shop_id"] +
      "</td><td> User:" +
      sql_result[ind]["user_id"] +
      "</td><td width=500>" +
      sql_result[ind]["review"] +
      "</td><td>" +
      sql_result[ind]["img"] +
      "</td></tr>";
  }
  html = html + "</table>";
  console.log(html);
  return html;
}

async function updateShop(shop_in, name_in, lat_in, long_in, loc_name_in) {
  console.log(shop_in);
  console.log(name_in);
  console.log(lat_in);
  console.log(long_in);
  console.log(loc_name_in);

  var input_param = [];
  input_param.push({ name: "shop_in", type: "C", value: shop_in });
  input_param.push({ name: "name_in", type: "C", value: name_in });
  input_param.push({ name: "lat_in", type: "C", value: lat_in });
  input_param.push({ name: "long_in", type: "C", value: long_in });
  input_param.push({ name: "loc_name_in", type: "C", value: loc_name_in });

  var sql =
    "update patois_merchant set merchant_shop_name=@name_in , update_by ='1' where merchant_id = @shop_in  ";

  console.log(sql);
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
