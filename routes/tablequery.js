const bodyParser = require("body-parser");
var queryString = require("querystring");
var util = require("./util.js");
var promise = require("promise");

var config_in = {
  userName: process.env.SQL_USER, // update me
  password: process.env.SQL_PASSWORD, // update me
  server: process.env.SQL_SERVER, // update me
  options: {
    database: process.env.SQL_DATABASE, //update me
    encrypt: process.env.SQL_ENCRYPT,
  },
};

var app_environment = process.env["APP_ENVIRONMENT"];
var v_update = "";
var v_form_h = "";
var v_form_d = "";

module.exports = {
  getPageHeader: function getPageHeader() {
    var host = "http://localhost:5000";
    if (app_environment == "Production") {
      host = "https://prd-web-admin-patois.azurewebsites.net";
    } else if (app_environment == "Uat") {
      host = "https://uat-patois-webadmin-back.azurewebsites.net";
    }

    console.log("Environment is : " + app_environment);
    console.log("Host is : " + host);

    let header =
      "<html><title>" +
      process.env.APP_ENVIRONMENT +
      " - " +
      util.getVersion() +
      '</title><head><script language="javascript"> ' +
      'function show(txtin,verifycode) { if  (confirm("ยืนยันการดำเนินการ !") == true) ' +
      ' { window.open("' +
      host +
      '/M5-8ZGnvdvRhWIkYjr7JCW3xLBGr5CyKxxL3LbCbAhrLUtM9LGyzrCDfUR34rNKKEpH?txtin=" + txtin +  "&verifycode=" + verifycode) ;} }   ' +
      " </script></head> ";
    return header;
  },

  getReview: async function getReview(code_in, type_in, input_param) {
    return new promise(function (fulfill, reject) {
      var select_sql = "select top 50 * ";

      var nearby_sql = " , 'X' nearby   ";
      if (type_in == "ReviewByShopID") {
        nearby_sql = " ,  dbo.get_shop_nearby(s.shop_id) nearby ";
      }

      var from_sql =
        "  from ( " +
        "    select store_type , case when s.active = 0 then 'I' else 'A' end status , s.images_id , 'Create' r_type ,  s.shop_id post_review_id, u.id , u.name , s.shop_id , dateadd(hour,7,s.created_at) created_at , s.shopName , recommend review , dbo.split_image_newv2(i.images_id ,description)  as img   ,  " +
        " cast(l.latitude as varchar) + ',' + cast(l.longitude as varchar)  as loc , '' as quality     " +
        nearby_sql +
        "    from  wongnok_shop s left join patois_images i  on i.images_id = s.images_id  left join users u on s.user_id = u.id    " +
        " left outer join wongnok_location l on s.location_id = l.location_id" +
        " union " +
        "    select ' ' , case when r.active = 0 then 'I' else 'A' end status ,  r.images_id ,  'Review' r_type , post_review_id, u.id , u.name , r.shop_id , dateadd(hour,7,r.created_at) created_at , s.shopName , review , dbo.split_image_newv2(i.images_id ,description)  as img  ,   " +
        " cast(l.latitude as varchar) + ',' + cast(l.longitude as varchar)  as loc , quality  " +
        nearby_sql +
        "    from  wongnok_post_review r left join patois_images i  on i.images_id = r.images_id   join  wongnok_shop s on r.shop_id = s.shop_id  join users u on r.user_id = u.id " +
        " left outer join wongnok_location l on s.location_id = l.location_id  where 1 = 1 ) ss ";

      if (type_in == "ReviewByDate") {
        user_sql =
          select_sql +
          from_sql +
          "  where created_at > convert(date,@start_in,112) and created_at < dateadd(day,1,convert(date,@end_in,112)) ";

        if (input_param[2]["value"] == "All") {
        } else {
          user_sql = user_sql + "  and quality = @quality_in ";
        }

        user_sql = user_sql + " order by created_at desc ";
      } else if (type_in == "ReviewByUser") {
        user_sql =
          "select top " +
          input_param[1]["value"] +
          " * " +
          from_sql +
          " where id = @user_in ";
        user_sql = user_sql + " order by created_at desc ";
      } else if (type_in == "ReviewByShopRange") {
        v_update = "X";
        user_sql =
          select_sql +
          from_sql +
          " where shop_id >= @start_in and shop_id < @end_in ";

        if (input_param[2]["value"] != "on") {
          user_sql =
            user_sql +
            " and r_type = 'Create' order by shop_id , post_review_id  ";
        } else {
          user_sql = user_sql + "  order by shop_id , post_review_id  ";
        }
      } else if (type_in == "ReviewByShopID") {
        user_sql =
          select_sql +
          from_sql +
          "  where shop_id in (" +
          input_param[0]["value"] +
          ")  ";

        if (input_param[2]["value"] != "on") {
          user_sql = user_sql + " and r_type = 'Create'  ";
        }

        user_sql = user_sql + " order by shop_id , created_at desc  ";
      } else if (type_in == "ReviewByShopName") {
        v_update = "X";
        user_sql = select_sql + from_sql + "  where shopname like @name_in  ";

        if (input_param[2]["value"] != "on") {
          user_sql = user_sql + " and r_type = 'Create' order by shopname ";
        } else {
          user_sql = user_sql + "   order by shopname ";
        }
      }

      //console.log(user_sql);
      util.querynewDB2(config_in, user_sql, input_param).then(function (data) {
        var sql_result = JSON.parse(data);
        sql_result = sql_result["results"];

        let img_tag = "";
        let img_src = "";

        let set_img = "";
        let merge_img = "";

        let html = "";
        html = html + "<table border=1>";
        for (ind = 0; ind < sql_result.length; ind++) {
          img_tag = "";
          set_img = "";
          merge_img = "";
          //          if (sql_result[ind]["post_review_id"] == sql_result[ind]["shop_id"]) {
          //          } else if (sql_result[ind]["images_id"] === null) {
          //          } else {
          let tmp = util.getEncrypt(code_in);
          let jsontxt = {
            id: sql_result[ind]["post_review_id"],
            type: "R",
            action: "1",
          };
          ////////////////////////////////////////////////////////////////
          if (sql_result[ind]["post_review_id"] == sql_result[ind]["shop_id"]) {
            jsontxt["type"] = "S";
          }

          if (sql_result[ind]["status"] == "A") {
            jsontxt["action"] = "0";

            img_tag =
              '<img src="https://ptg-test-php01-uat.azurewebsites.net/del.jpg" width=20 onclick="show(' +
              "'" +
              util.getEncrypt(JSON.stringify(jsontxt)) +
              "','" +
              tmp +
              "'); " +
              ' "> ';
          } else if (sql_result[ind]["status"] == "I") {
            img_tag =
              '<img src="https://ptg-test-php01-uat.azurewebsites.net/enable.jpg" width=20 onclick="show(' +
              "'" +
              util.getEncrypt(JSON.stringify(jsontxt)) +
              "','" +
              tmp +
              "'); " +
              ' "> ';
          }

          /////////////////////////////////////////////////////////////////

          if (input_param[4]["value"] == "on") {
            img_src = "";
            img_tag = "";
          } else {
            img_src = sql_result[ind]["img"];
          }
          //////////////////////////////////////////////////////////
          if (
            v_update == "X" &&
            sql_result[ind]["r_type"] == "Create" &&
            input_param[4]["value"] == "Y"
          ) {
            v_form_h =
              '<form method="post" action="/M1-Br2rvh55iHFl6dJ6Ph7j1cli68pmR8t01CMu4BzstpS6KuDd8AIgwjjdQqpRMpbC"><input type=hidden name="update_flag" value="X"> <input type=hidden name="shop_in" value="' +
              sql_result[ind]["post_review_id"] +
              '">';
            v_form_d =
              '<input type=text name="new_shop_name" value="' +
              sql_result[ind]["shopName"] +
              '" size=40>' +
              '<input type="submit" value="update"> <input type="hidden" name="verifycode" value="' +
              code_in +
              '"></form>' +
              "";
          } else {
            v_form_h = "";
            v_form_d = sql_result[ind]["shopName"];
          }
          /////////////////////////////////////////////////////////

          //console.log("--->" + "\n" + img_src);

          if (
            type_in == "ReviewByShopID" ||
            type_in == "ReviewByShopRange" ||
            type_in == "ReviewByShopName"
          ) {
            if (sql_result[ind]["images_id"] !== null) {
              set_img =
                '</td><td><img src="https://ptg-test-php01-uat.azurewebsites.net/coverpic.jpg" width=20 onclick="show(' +
                "'" +
                util.getEncrypt(
                  JSON.stringify({
                    id: sql_result[ind]["shop_id"],
                    type: "I",
                    action: sql_result[ind]["images_id"],
                  })
                ) +
                "','" +
                tmp +
                "'); " +
                ' "> ';

              //                '/M5-8ZGnvdvRhWIkYjr7JCW3xLBGr5CyKxxL3LbCbAhrLUtM9LGyzrCDfUR34rNKKEpH?txtin=" + txtin +  "&verifycode=" + verifycode) ;} }   ' +
              if (sql_result[ind]["r_type"] == "Create") {
                merge_img =
                  '</td><td><form method="POST" target=new123 action="/M5-8ZGnvdvRhWIkYjr7JCW3xLBGr5CyKxxL3LbCbAhrLUtM9LGyzrCDfUR34rNKKEpH?verifycode=' +
                  tmp +
                  "&txtin=" +
                  util.getEncrypt(
                    JSON.stringify({
                      id: sql_result[ind]["shop_id"],
                      type: "M",
                      action: 1,
                    })
                  ) +
                  '"><input type=submit value="Merge to =>"> <input type="text" name="to_shop" size=6> </form>  ';
              } else {
                merge_img = "</td><td>";
              }
            }
          } else {
            set_img = "";
            merge_img = "";
          }

          let nearby_txt = "";
          if (type_in == "ReviewByShopID") {
            nearby_txt = "<td width=300>" + sql_result[ind]["nearby"] + "</td>";
          }

          html =
            html +
            "<tr><td>" +
            v_form_h +
            img_tag +
            "</td><td> " +
            sql_result[ind]["status"] +
            "</td><td> " +
            sql_result[ind]["store_type"] +
            "</td><td> " +
            sql_result[ind]["r_type"] +
            "<br>" +
            sql_result[ind]["created_at"] +
            "</td><td> " +
            sql_result[ind]["post_review_id"] +
            "</td><td width=150> " +
            sql_result[ind]["name"] +
            "<br>(" +
            sql_result[ind]["id"] +
            ") " +
            "</td><td width=200>" +
            v_form_d +
            '<br><a href="https://maps.google.com/?q=' +
            sql_result[ind]["loc"] +
            '" target="new"' +
            sql_result[ind]["post_review_id"] +
            ">(" +
            sql_result[ind]["loc"] +
            ")</a>" +
            "</td> " +
            nearby_txt +
            "<td width=250>" +
            sql_result[ind]["review"] +
            "</td><td>" +
            sql_result[ind]["quality"] +
            "</td><td >" +
            img_src +
            set_img +
            merge_img +
            "</td></tr>";
        }
        html = html + "</table><br>";

        fulfill(html);
      });
    });
  },
};
