var express = require("express");
var router = express.Router();
const bodyParser = require("body-parser");
var queryString = require("querystring");
var util = require("./util.js");
var promise = require("promise");
var request = require("request");
var tablequery = require("./tablequery");
const { LOGGING } = require("./util.js");
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

var export_flag = "";
var code_in = "";

var rec_in = "";
/* GET home page. */
router.all("/", isAuthenticated, function (req, res, next) {
  export_flag = req.body["export_flag"];

  var user_in = req.body["user_in"];

  var name_in = req.body["name_in"];

  var mobile_in = req.body["mobile_in"];

  var ecode_in = req.body["ecode_in"];

  code_in = req.body["verifycode"];

  var max_in = req.body["max_in"];

  rec_in = req.body["rec_in"];

  console.log("------------>" + name_in);

  if (code_in != util.verify()) {
    res.send("Unauthorized");
    return;
  }

  var rec_txt = "";

  if (rec_in != "" && rec_in != undefined) {
    rec_txt = '<input type=text name="rec_in" value=' + rec_in + ">";
  } else {
    rec_txt = '<input type=text name="rec_in" value=25 > ';
  }

  var pform =
    tablequery.getPageHeader() +
    "<body> " +
    '<table><tr><td><form method="post" action="/index-main"><input type="submit" value="<--- Back to menu"> <input type="hidden" name="verifycode" value="' +
    code_in +
    '"></form></td></tr><tr><td width=300>Search Mobile No. <form method="post" action="/M2-TyiiDw85ZRfUjyZq2hGQrcqnFhZ5oaxXnwQvyvhhyXpPfV9w7jWkEfH5amlwOWc4" ><input type=text name="mobile_in"> <input type="submit"><input type="hidden" name="verifycode" value="' +
    code_in +
    '"> </form> </td> <td>' +
    'Search UserName/Email <form method="post" action="/M2-TyiiDw85ZRfUjyZq2hGQrcqnFhZ5oaxXnwQvyvhhyXpPfV9w7jWkEfH5amlwOWc4" ><input type=text name="name_in"> <input type="submit"> <input type="hidden" name="verifycode" value="' +
    code_in +
    '"></form> </td></tr>' +
    '<tr><td>Search CRM MaxCard<form method="post" action="/M2-TyiiDw85ZRfUjyZq2hGQrcqnFhZ5oaxXnwQvyvhhyXpPfV9w7jWkEfH5amlwOWc4" ><input type=text name="max_in"> <input type="submit"> <input type="hidden" name="verifycode" value="' +
    code_in +
    '"></form> </td>' +
    '<td>Search CRM E-code<form method="post" action="/M2-TyiiDw85ZRfUjyZq2hGQrcqnFhZ5oaxXnwQvyvhhyXpPfV9w7jWkEfH5amlwOWc4" ><input type=text name="ecode_in"> <input type="submit"> <input type="hidden" name="verifycode" value="' +
    code_in +
    '"></form> </td></tr>' +
    '<tr><td colspan=2>Search review activity by UserID<form method="post" action="/M2-TyiiDw85ZRfUjyZq2hGQrcqnFhZ5oaxXnwQvyvhhyXpPfV9w7jWkEfH5amlwOWc4" ><input type=text name="user_in"> Record => ' +
    rec_txt +
    ' <input type="submit"><input type="hidden" name="verifycode" value="' +
    code_in +
    '"> </form> </td>' +
    "</tr>" +
    "<tr></tr>" +
    "</table>";

  if (name_in != "" && name_in != undefined) {
    getUserTable(name_in).then(function (data) {
      res.send(pform + "Search => " + name_in + "<br>" + data);
    });
  } else if (user_in != "" && user_in !== undefined) {
    getUserIDTable(user_in).then(function (data) {
      res.send(pform + data);
    });
  } else if (ecode_in != "" && ecode_in !== undefined) {
    getEcodeTable(ecode_in).then(function (data) {
      res.send(pform + data);
    });
  } else if (max_in != "" && max_in !== undefined) {
    getMaxTable(max_in).then(function (data) {
      res.send(pform + data);
    });
  } else if (mobile_in != "" && mobile_in !== undefined) {
    getMobileTable(mobile_in).then(function (crm) {
      getUserTable(mobile_in).then(function (data) {
        res.send(
          pform + "1. CRM Data => " + crm + "<br>" + "2. Patois Data =>" + data
        );
      });
    });
  } else {
    res.send(pform + user_in + "<br>" + "xxxx");
  }
});

async function getMobileTable(mobile_in) {
  return new promise(function (fulfill, reject) {
    var uData = JSON.stringify({
      cardno: "",
      phoneNo: mobile_in,
      citizenId: "",
    });

    let headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(uData),
      "req-key": "911f095425e34389a174465a58f46143",
    };

    request.post(
      {
        url: "https://crm-apim-services.pt.co.th/prd-mloyalty/api/Card/ListInfo",
        headers: headers,
        body: uData,
      },
      (err, res, body) => {
        //console.log("status => " + body);
        let result_str = JSON.parse(body);
        let result_code = result_str["responseCode"];
        let result_msg = result_str["responseMessage"];

        //console.log(result_code + "," + result_msg);

        if (result_code == "00") {
          let sql_result = result_str["resultModel"]["cardIdInfo"];

          var html = "";

          html = html + "<table border=1>";
          for (ind = 0; ind < sql_result.length; ind++) {
            let v_phone = sql_result[ind]["phoneNo"];
            let v_status = "Inactive";
            if (sql_result[ind]["cardStatus"] == "I") v_status = "Active";
            //v_phone = v_phone.substr(0, 4) + "XXX" + v_phone.substr(7, 3);
            html =
              html +
              "<tr><td><font color='red'>" +
              sql_result[ind]["cardNo"] +
              "</font></td><td>" +
              v_phone +
              "</td><td>" +
              v_status +
              "</td><td>" +
              sql_result[ind]["cardActivateDate"] +
              "</td></tr>";
          }
          html = html + "</table>";
        }
        fulfill(html);
      }
    );
  });
}

async function getMaxTable(max_in) {
  return new promise(function (fulfill, reject) {
    var uData = JSON.stringify({
      cardno: max_in,
      phoneNo: "",
      citizenId: "",
    });

    let headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(uData),
      "req-key": "911f095425e34389a174465a58f46143",
    };

    request.post(
      {
        url: "https://crm-apim-services.pt.co.th/prd-mloyalty/api/Card/ListInfo",
        headers: headers,
        body: uData,
      },
      (err, res, body) => {
        //console.log("status => " + body);
        let result_str = JSON.parse(body);
        let result_code = result_str["responseCode"];
        let result_msg = result_str["responseMessage"];

        //console.log(result_code + "," + result_msg);

        if (result_code == "00") {
          let sql_result = result_str["resultModel"]["cardIdInfo"];

          var html = "";

          html = html + "<table border=1>";
          for (ind = 0; ind < sql_result.length; ind++) {
            let v_phone = sql_result[ind]["phoneNo"];
            //v_phone = v_phone.substr(0, 4) + "XXX" + v_phone.substr(7, 3);
            html =
              html +
              "<tr><td>" +
              sql_result[ind]["cardNo"] +
              "</td><td>" +
              v_phone +
              "</td><td>" +
              sql_result[ind]["cardStatus"] +
              "</td><td>" +
              sql_result[ind]["cardActivateDate"] +
              "</td></tr>";
          }
          html = html + "</table>";
        }
        fulfill(html);
      }
    );
  });
}

async function getEcodeTable(mobile_in) {
  return new promise(function (fulfill, reject) {
    var uData = JSON.stringify({
      Ecode: mobile_in,
    });

    let headers = {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(uData),
      "req-key": "911f095425e34389a174465a58f46143",
    };

    request.post(
      {
        url: "https://crm-apim-services.pt.co.th/prd-mloyalty/api/Ecode/Detail",
        headers: headers,
        body: uData,
      },
      (err, res, body) => {
        //console.log("status => " + body);
        let result_str = JSON.parse(body);
        let result_code = result_str["responseCode"];
        let result_msg = result_str["responseMessage"];

        //console.log(result_code + "," + result_msg);

        if (result_code == "00") {
          let sql_result = result_str["resultModel"];

          var html = "";

          html = html + "<table border=1>";
          html =
            html +
            "<tr><td>" +
            sql_result["ecode"] +
            "</td><td>" +
            sql_result["ecodeName"] +
            "</td><td> สถานะ : " +
            sql_result["remainQuantity"] +
            "</td><td>" +
            sql_result["ecodeStatus"] +
            "</td></tr>";

          html = html + "</table>";
        }
        fulfill(html);
      }
    );
  });
}

async function getUserTable(name_in) {
  var input_param = [];
  input_param.push({ name: "name_in", type: "C", value: "%" + name_in + "%" });

  var user_sql =
    "select top 20 * from ( " +
    " select  id , name ,  email ,  patois_tel ,u.line_id , u.patois_maxcard_id ,  l.userline_name , dateadd(hour,7,u.created_at) created_at from users u  left join  wongnok_line l on u.line_id = l.userline_id left join patois_maxcard m on u.id = m.patois_user_id  where name like @name_in or email like @name_in or  l.userline_name like @name_in " +
    " union " +
    " select  id , name ,  email ,  patois_tel ,u.line_id , u.patois_maxcard_id ,   l.userline_name, dateadd(hour,7,u.created_at) created_at   from users u  left join  wongnok_line l on u.line_id = l.userline_id left join patois_maxcard m on u.id = m.patois_user_id where patois_tel like @name_in ) x " +
    " order by id desc  ";
  //console.log(user_sql);
  var shop_result = await util.querynewDB2(config_in, user_sql, input_param);
  shop_result = JSON.parse(shop_result);
  let html = "";

  data = await util.querynewDB2(config_in, user_sql, input_param);
  sql_result = JSON.parse(data);

  sql_result = sql_result["results"];
  html = html + "<table border=1>";
  for (ind = 0; ind < sql_result.length; ind++) {
    html =
      html +
      "<tr><td><font color='blue'> ID : " +
      sql_result[ind]["id"] +
      "</font></td><td>" +
      sql_result[ind]["name"] +
      "</td><td>" +
      sql_result[ind]["email"] +
      "</td><td>" +
      sql_result[ind]["patois_tel"] +
      "</td><td><font color='orange'>  Maxcard ID:  : " +
      sql_result[ind]["patois_maxcard_id"] +
      "</font></td><td> <font color=Fuchsia>Line id : " +
      sql_result[ind]["line_id"] +
      "</font>" +
      "</td><td> Line Name : " +
      sql_result[ind]["userline_name"] +
      "</td><td>  " +
      sql_result[ind]["created_at"] +
      "</td></tr>";
  }
  html = html + "</table><br>";
  //console.log(html);

  ///////////////////////////////////////////////////////////////
  input_param = [];
  input_param.push({ name: "name_in", type: "C", value: name_in });

  user_sql =
    "select   m.patois_maxcard_id , patois_tel , patois_maxcard_no , patois_status ,patois_active , patois_created_at , patois_updated_at , u.id , u.name from patois_maxcard m left join users u on m.patois_user_id = u.id where patois_tel =  @name_in ";
  //  shop_result = await util.querynewDB2(config_in, user_sql, input_param);
  //  shop_result = JSON.parse(shop_result);

  data = await util.querynewDB2(config_in, user_sql, input_param);
  sql_result = JSON.parse(data);
  sql_result = sql_result["results"];
  html = html + "<table border=1><tr>3. Maxcard Mapping</tr>";
  for (ind = 0; ind < sql_result.length; ind++) {
    html =
      html +
      "<tr><td><font color='orange'>Maxcard_id : " +
      sql_result[ind]["patois_maxcard_id"] +
      "</font></td><td>" +
      sql_result[ind]["patois_tel"] +
      "</td><td><font color='red'>Max:" +
      sql_result[ind]["patois_maxcard_no"] +
      "</font></td><td>" +
      sql_result[ind]["patois_status"] +
      "</td><td><font color='blue'> ID : " +
      sql_result[ind]["id"] +
      "</font></td><td>" +
      sql_result[ind]["name"] +
      "</td><td>" +
      sql_result[ind]["patois_created_at"] +
      "</td><td>" +
      sql_result[ind]["patois_updated_at"] +
      "</td></tr>";
  }
  html = html + "</table><br>";

  return html;
}

async function getUserIDTable(user_in) {
  var input_param = [];
  input_param.push({ name: "user_in", type: "C", value: user_in });

  var user_sql =
    "select case when active = 0 then 'InActive' else 'Active' end status  , id ,  name ,  email , l.userline_name , created_at from users u left join  wongnok_line l on u.line_id = l.userline_id where id = @user_in ";
  //  var shop_result = await util.querynewDB2(config_in, user_sql, input_param);
  //  shop_result = JSON.parse(shop_result);
  let html = "";

  data = await util.querynewDB2(config_in, user_sql, input_param);
  sql_result = JSON.parse(data);

  sql_result = sql_result["results"];
  html = html + "<table border=1> User Profile";
  let tmp = "";
  let tmp1 = "";
  let jsontxt = "";
  let img_tag = "";
  for (ind = 0; ind < sql_result.length; ind++) {
    tmp = util.getEncrypt(code_in);
    jsontxt = {
      id: sql_result[ind]["id"],
      type: "U",
      action: "0",
    };

    let u_status = "<font color=Blue>" + sql_result[ind]["status"] + "</font>";
    if (sql_result[ind]["status"] == "InActive") {
      jsontxt["action"] = 1;
      u_status = "<font color=red>" + sql_result[ind]["status"] + "</font>";
    }

    if (sql_result[ind]["status"] == "Active") {
      jsontxt["action"] = "0";

      img_tag =
        '<img src="https://ptg-test-php01-uat.azurewebsites.net/del.jpg" width=20 onclick="show(' +
        "'" +
        util.getEncrypt(JSON.stringify(jsontxt)) +
        "','" +
        tmp +
        "'); " +
        ' "> ';
    } else if (sql_result[ind]["status"] == "InActive") {
      img_tag =
        '<img src="https://ptg-test-php01-uat.azurewebsites.net/enable.jpg" width=20 onclick="show(' +
        "'" +
        util.getEncrypt(JSON.stringify(jsontxt)) +
        "','" +
        tmp +
        "'); " +
        ' "> ';
    }

    html =
      html +
      "<tr><td> " +
      u_status +
      "</td><td>" +
      sql_result[ind]["id"] +
      "</td><td>" +
      sql_result[ind]["name"] +
      "</td><td>" +
      sql_result[ind]["email"] +
      "</td><td>" +
      sql_result[ind]["userline_name"] +
      "</td><td>" +
      sql_result[ind]["created_at"] +
      "</td><td>" +
      img_tag +
      "</td></tr>";
  }
  html = html + "</table><br>";

  ///////////////////////////////////////////////////
  user_sql =
    "select   patois_tel , patois_maxcard_no , patois_status ,patois_active , patois_created_at , patois_updated_at from patois_maxcard where patois_user_id =  @user_in ";
  //  shop_result = await util.querynewDB2(config_in, user_sql, input_param);
  //  shop_result = JSON.parse(shop_result);

  data = await util.querynewDB2(config_in, user_sql, input_param);
  sql_result = JSON.parse(data);
  sql_result = sql_result["results"];
  html = html + "<table border=1><tr>Maxcard Mapping</tr>";

  jsontxt = {
    id: user_in,
    type: "UM",
    action: "0",
  };
  tmp = util.getEncrypt(code_in);
  tmp1 = util.getEncrypt(JSON.stringify(jsontxt));

  for (ind = 0; ind < sql_result.length; ind++) {
    img_tag =
      '<form method="post" target="new11" action="/M5-8ZGnvdvRhWIkYjr7JCW3xLBGr5CyKxxL3LbCbAhrLUtM9LGyzrCDfUR34rNKKEpH?txtin=' +
      tmp1 +
      "&verifycode=" +
      tmp +
      '"><input type=hidden name="update_flag" value="X"> <input type=hidden name="shop_in" value="' +
      user_in +
      '">' +
      '<input type=text name="to_shop" value="' +
      sql_result[ind]["patois_maxcard_no"] +
      '" size=10>' +
      '<input type="submit" value="update"> </form>' +
      "";

    html =
      html +
      "<tr><td>" +
      sql_result[ind]["patois_tel"] +
      "</td><td>" +
      sql_result[ind]["patois_maxcard_no"] +
      img_tag +
      "</td><td>" +
      sql_result[ind]["patois_status"] +
      "</td><td>" +
      sql_result[ind]["patois_created_at"] +
      "</td><td>" +
      sql_result[ind]["patois_updated_at"] +
      "</td></tr>";
  }
  html = html + "</table><br>";

  //////// Notification & Coupon Section /////////////////////////////////

  user_sql =
  "select top 20 convert(varchar(20) , created_at , 120 ) created_date , title , description , types  from patois_notifications " 
  + " where user_id = @user_in   order by notifications_id desc" 
  //  shop_result = await util.querynewDB2(config_in, user_sql, input_param);
  //  shop_result = JSON.parse(shop_result);

  data = await util.querynewDB2(config_in, user_sql, input_param);
  sql_result = JSON.parse(data);
  sql_result = sql_result["results"];
  html = html + "<table border=1><tr>Notification</tr>";

  jsontxt = {
    id: user_in,
    type: "UM",
    action: "0",
  };
  tmp = util.getEncrypt(code_in);
  tmp1 = util.getEncrypt(JSON.stringify(jsontxt));

  for (ind = 0; ind < sql_result.length; ind++) {
    /*
    img_tag =
      '<form method="post" target="new11" action="/M5-8ZGnvdvRhWIkYjr7JCW3xLBGr5CyKxxL3LbCbAhrLUtM9LGyzrCDfUR34rNKKEpH?txtin=' +
      tmp1 +
      "&verifycode=" +
      tmp +
      '"><input type=hidden name="update_flag" value="X"> <input type=hidden name="shop_in" value="' +
      user_in +
      '">' +
      '<input type=text name="to_shop" value="' +
      sql_result[ind]["patois_maxcard_no"] +
      '" size=10>' +
      '<input type="submit" value="update"> </form>' +
      "";
*/

    html =
      html +
      "<tr><td>" +
      sql_result[ind]["created_date"] +
      "</td><td>" +
      sql_result[ind]["title"] +
      "</td><td>" +
      sql_result[ind]["description"] +
      "</td><td>" +
      sql_result[ind]["types"] +
      "</td></tr>";
  }
  html = html + "</table><br>";

  ///////////////////////////////////////////////////
  user_sql =

"  select top 5 convert(varchar(20) , create_date , 120 ) created_date , promo_ref_id , promo_ref_type , promo_code , promo_name, "
+ " campaign_name , page_type , attend_type , ref_code  , promo_status "
+ " from patois_campaign_transaction ct  left join patois_campaign c on c.campaign_id = ct.campaign_id " 
+ " left join patois_promotion p on ct.promo_ref_id = p.promo_id "
+ " where user_id = @user_in  order by ct.campaign_transaction_id desc "

  data = await util.querynewDB2(config_in, user_sql, input_param);
  sql_result = JSON.parse(data);
  sql_result = sql_result["results"];
  html = html + "<table border=1><tr>Campaign</tr>";

  for (ind = 0; ind < sql_result.length; ind++) {
    html =
      html +
      "<tr><td>" +
      sql_result[ind]["created_date"] +
      "</td><td>" +
      sql_result[ind]["promo_ref_id"] +
      "</td><td>" +
      sql_result[ind]["promo_ref_type"] +
      "</td><td>" +
      sql_result[ind]["promo_code"] +
            "</td><td>" +
      sql_result[ind]["promo_status"] +
      "</td><td>" +
      sql_result[ind]["promo_name"] +
      "</td><td>" +
      sql_result[ind]["campaign_name"] +
      "</td><td>" +
      sql_result[ind]["page_type"] +
      "</td><td>" +
      sql_result[ind]["attend_type"] +
      "</td><td>" +
      sql_result[ind]["ref_code"] +
      "</td></tr>";
  }
  html = html + "</table><br>";


  ///////////////////////////////////////////////////

  var input_param = [];
  input_param.push({ name: "user_in", type: "C", value: user_in });
  input_param.push({ name: "rec_in", type: "C", value: rec_in });
  input_param.push({ name: "xxx1", type: "C", value: "Y" });
  input_param.push({ name: "xxx2", type: "C", value: "Y" });
  input_param.push({ name: "export_in", type: "C", value: "off" });

  let query_result = await tablequery.getReview(
    code_in,
    "ReviewByUser",
    input_param
  );
  //console.log(query_result);
  html = html + query_result;

  /* 
  user_sql =
    "  select top " +
    rec_in +
    " * from ( " +
    "    select s.images_id ,  'Create Shop' r_type ,  shop_id post_review_id, s.shop_id , dateadd(hour,7,s.created_at) created_at , s.shopName , recommend review , dbo.split_image_newv1(i.description)  as img     " +
    "    from  wongnok_shop s left join patois_images i  on i.images_id = s.images_id    where  s.user_id = @user_in  " +
    " union " +
    "    select  r.images_id ,  'Review Shop' r_type , post_review_id, r.shop_id , dateadd(hour,7,r.created_at) created_at , s.shopName , review , dbo.split_image_newv1(i.description)  as img     " +
    "    from  wongnok_post_review r left join patois_images i  on i.images_id = r.images_id   join  wongnok_shop s on r.shop_id = s.shop_id   where r.active = 1 and  r.user_id = @user_in  " +
    " ) ss order by created_at desc ";

  console.log(user_sql);
  data = await util.querynewDB2(config_in, user_sql, input_param);
  sql_result = JSON.parse(data);
  sql_result = sql_result["results"];

  let img_tag = "";
  html = html + "<table border=1><tr>Activity</tr>";
  for (ind = 0; ind < sql_result.length; ind++) {
    img_tag = "";
    if (sql_result[ind]["post_review_id"] == sql_result[ind]["shop_id"]) {
    } else if (sql_result[ind]["images_id"] === null) {
    } else {
      var tmp = code_in;
      tmp = tmp + "";
      tmp = util.encrypt3DES(tmp, "Maxventures");
      tmp = Buffer.from(tmp, "utf8").toString("hex");
      //      console.log(tmp);

      tmp = tmp + ""; // convert to string
      img_tag =
        '<img src="https://ptg-test-php01-uat.azurewebsites.net/del.jpg" width=20 onclick="show(' +
        sql_result[ind]["post_review_id"] +
        ",'" +
        tmp +
        "','R'); " +
        ' "> ';
    }

    html =
      html +
      "<tr><td>" +
      img_tag +
      "</td><td> " +
      sql_result[ind]["r_type"] +
      "</td><td> " +
      sql_result[ind]["shop_id"] +
      "</td><td> " +
      sql_result[ind]["post_review_id"] +
      "</td><td>" +
      sql_result[ind]["shopName"] +
      "</td><td>" +
      sql_result[ind]["created_at"] +
      "</td><td width=300>" +
      sql_result[ind]["review"] +
      "</td><td width=300>" +
      sql_result[ind]["img"] +
      "</td></tr>";
  }
  html = html + "</table><br>";
*/
  ///////////////////////////////////////////////////
  user_sql =
    " select top " +
    rec_in +
    "  referenceid , interface_log_id ,  referencetype , promoscode , dateadd(hour,7,response_at) response_at ,  " +
    " maxpoint , JSON_VALUE(response_data, '$.STATUS.RESPONSE_CODE') res_code , JSON_VALUE(response_data,  " +
    " '$.STATUS.RESPONSE_MESSAGE') res_msg ,  JSON_VALUE(response_data, '$.DATA.TRANS_POINT') point from patois_interface_log " +
    "where request_to = 'CRM-MAXCARD' and user_id = @user_in order by interface_log_id desc ";

  //  shop_result = await util.querynewDB2(config_in, user_sql, input_param);
  //  shop_result = JSON.parse(shop_result);

  data = await util.querynewDB2(config_in, user_sql, input_param);
  sql_result = JSON.parse(data);
  sql_result = sql_result["results"];
  html = html + "<table border=1><tr>Interface CRM </tr>";
  for (ind = 0; ind < sql_result.length; ind++) {
    html =
      html +
      "<tr><td>" +
      sql_result[ind]["interface_log_id"] +
      "</td><td>Ref : " +
      sql_result[ind]["referenceid"] +
      "</td><td>" +
      sql_result[ind]["referencetype"] +
      "</td><td>" +
      sql_result[ind]["promoscode"] +
      "</td><td>" +
      sql_result[ind]["referencetype"] +
      "</td><td>" +
      sql_result[ind]["response_at"] +
      "</td><td>" +
      sql_result[ind]["maxpoint"] +
      "</td><td>" +
      sql_result[ind]["res_code"] +
      "</td><td>" +
      sql_result[ind]["res_msg"] +
      "</td><td >Point : " +
      sql_result[ind]["point"] +
      "</td></tr>";
  }
  html = html + "</table><br>";

  return html;
}

module.exports = router;
