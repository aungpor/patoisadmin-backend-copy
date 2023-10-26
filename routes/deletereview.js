var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
var queryString = require("querystring");
var util = require("./util.js");
var promise = require("promise");
const { type } = require("os");

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
router.all("/", function (req, res, next) {
  var code_in = req.query["verifycode"];

  var txtin = req.query["txtin"];

  var to_shop = req.body["to_shop"];

  if (
    code_in ==
    "8ZGnvdvRhWIkYjr7JCW3xLBGr5CyKxxL3LbCbAhrLUtM9LGyzrCDfUR34rNKKEpH"
  ) {
    console.log(txtin);
    delImage(txtin).then(function (data) {
      res.send("Ok");
    });
  } else {
    var tmp1 = util.getDecrypt(txtin);

    if (tmp1 == "Error") {
      res.send("Unknown");
      return;
    }

    tmp = util.getDecrypt(code_in);

    if (tmp != util.verify()) {
      res.send("Unauthorized");
      return;
    }

    tmp1 = JSON.parse(tmp1);
    var review_in = tmp1["id"];
    var type_in = tmp1["type"];
    var action_in = tmp1["action"];
    //console.log(review_in, code_in, type_in, action_in);

    //console.log("=====> " + type_in);
    if (type_in == "U") {
      console.log("user delete");

      delUser(review_in, action_in).then(function (data) {
        res.send(data);
      });
    } else if (type_in == "I") {
      updateCoverPic(review_in, action_in).then(function (data) {
        res.send(data);
      });
    } else if (type_in == "R") {
      delReview(review_in, action_in).then(function (data) {
        res.send(data);
      });
    } else if (type_in == "S") {
      delShop(review_in, action_in).then(function (data) {
        res.send(data);
      });
    } else if (type_in == "M") {
      mergeShop(to_shop, review_in).then(function (data) {
        res.send(data);
      });
    } else if (type_in == "UM") {
      updateMaxcard(review_in, to_shop).then(function (data) {
        res.send(data);
      });
    } else {
      res.send("Invalid data");
    }
  }
});

async function delReview(review_in, action_in) {
  var input_param = [];
  input_param.push({ name: "review_id", type: "C", value: review_in });
  input_param.push({ name: "action_in", type: "C", value: action_in });

  var sql =
    "update wongnok_post_review set active=@action_in , updated_at = getdate() , updated_by ='webadmin' where post_review_id = @review_id  ";

  data = await util.querynewDB2(config_in, sql, input_param);
  sql_result = JSON.parse(data);

  sql_result = sql_result["results"];
  let html = "";
  html = html + "<table border=1><tr><td>" + data;

  html = html + "</tr></td></table>";

  /////////////////////////////////////////////////////////////////////////
  let log_param = [];
  log_param.push({ name: "func_in", type: "C", value: "Delete review" });
  log_param.push({
    name: "param_in",
    type: "C",
    value: JSON.stringify({ ReviewID: review_in, Action: action_in }),
  });
  log_param.push({ name: "msg_in", type: "C", value: data });

  util.LOGGING(config_in, log_param);
  ///////////////////////////////////////////////////////////////////

  return html;
}

async function updateMaxcard(review_in, max_in) {
  var input_param = [];
  input_param.push({ name: "user_id", type: "C", value: review_in });
  input_param.push({ name: "new_max", type: "C", value: max_in });

  var sql =
    "update patois_maxcard set patois_maxcard_no=@new_max , patois_update_by ='-1' , patois_updated_at = getdate()  where patois_user_id = @user_id  ";

  data = await util.querynewDB2(config_in, sql, input_param);
  sql_result = JSON.parse(data);

  sql_result = sql_result["results"];
  let html = "";
  html = html + "<table border=1><tr><td>" + data;

  html = html + "</tr></td></table>";

  /////////////////////////////////////////////////////////////////////////
  let log_param = [];
  log_param.push({ name: "func_in", type: "C", value: "Update Maxcard" });
  log_param.push({
    name: "param_in",
    type: "C",
    value: JSON.stringify({ UserID: review_in, maxcard: max_in }),
  });
  log_param.push({ name: "msg_in", type: "C", value: data });

  util.LOGGING(config_in, log_param);
  ///////////////////////////////////////////////////////////////////

  return html;
}

async function delImage(review_in, action_in) {
  var input_param = [];
  input_param.push({ name: "image_in", type: "C", value: review_in });

  var sql = "exec delete_image @image_in  ";

  data = await util.querynewDB2(config_in, sql, input_param);
  sql_result = JSON.parse(data);

  sql_result = sql_result["results"];
  let html = "";
  html = html + "<table border=1><tr><td>" + data;

  html = html + "</tr></td></table>";

  /////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////

  return html;
}

async function updateCoverPic(review_in, action_in) {
  var input_param = [];
  input_param.push({ name: "shop_in", type: "C", value: review_in });
  input_param.push({ name: "images_in", type: "C", value: action_in });

  var sql =
    "update wongnok_shop set images_id=@images_in where shop_id = @shop_in  ";

  data = await util.querynewDB2(config_in, sql, input_param);
  sql_result = JSON.parse(data);

  sql_result = sql_result["results"];
  let html = "";
  html = html + "<table border=1><tr><td>" + data;

  html = html + "</tr></td></table>";

  return html;
}

async function mergeShop(to_shop, from_shop) {
  var input_param = [];
  input_param.push({ name: "to_shop", type: "C", value: to_shop });
  input_param.push({ name: "from_shop", type: "C", value: from_shop });

  var sql = "exec merge_shop_data  @to_shop ,  @from_shop  ";

  data = await util.querynewDB2(config_in, sql, input_param);
  sql_result = JSON.parse(data);

  sql_result = sql_result["results"];
  let html = "";
  html = html + "<table border=1><tr><td>" + data;

  html = html + "</tr></td></table>";

  return html;
}

async function delShop(review_in, action_in) {
  var input_param = [];
  input_param.push({ name: "review_id", type: "C", value: review_in });
  input_param.push({ name: "action_in", type: "C", value: action_in });

  var sql =
    "update wongnok_shop set active=@action_in , interface_from ='webadmin' where shop_id = @review_id  ";

  data = await util.querynewDB2(config_in, sql, input_param);
  sql_result = JSON.parse(data);

  sql_result = sql_result["results"];
  let html = "";
  html = html + "<table border=1><tr><td>" + data;

  html = html + "</tr></td></table>";

  /////////////////////////////////////////////////////////////////////////
  let log_param = [];
  log_param.push({ name: "func_in", type: "C", value: "Delete shop" });
  log_param.push({
    name: "param_in",
    type: "C",
    value: JSON.stringify({ ShopID: review_in, Action: action_in }),
  });
  log_param.push({ name: "msg_in", type: "C", value: data });

  util.LOGGING(config_in, log_param);
  ///////////////////////////////////////////////////////////////////

  return html;
}
async function update_image(review_in, filelist_in) {
  var input_param = [];
  input_param.push({ name: "review_id", type: "C", value: review_in });
  input_param.push({ name: "filelist_in", type: "C", value: filelist_in });

  var sql =
    "update patois_images set description=@filelist_in where  images_id = @review_id  ";

  data = await util.querynewDB2(config_in, sql, input_param);
  sql_result = JSON.parse(data);

  sql_result = sql_result["results"];
  let html = "";
  html = html + "<table border=1><tr><td>" + data;

  html = html + "</tr></td></table>";

  return html;
}

async function delUser(review_in, action_in) {
  var input_param = [];
  input_param.push({ name: "review_id", type: "C", value: review_in });
  input_param.push({ name: "action_in", type: "C", value: action_in });

  var sql =
    "update users set active=@action_in , updated_at = getdate() where id = @review_id  ";

  data = await util.querynewDB2(config_in, sql, input_param);
  sql_result = JSON.parse(data);

  sql_result = sql_result["results"];
  let html = "";
  html = html + "<table border=1><tr><td>" + data;

  html = html + "</tr></td></table>";

  /////////////////////////////////////////////////////////////////////////
  let log_param = [];
  log_param.push({ name: "func_in", type: "C", value: "Delete user" });
  log_param.push({
    name: "param_in",
    type: "C",
    value: JSON.stringify({ UserID: review_in, Action: action_in }),
  });
  log_param.push({ name: "msg_in", type: "C", value: data });

  util.LOGGING(config_in, log_param);
  ///////////////////////////////////////////////////////////////////

  return html;
}
module.exports = router;
