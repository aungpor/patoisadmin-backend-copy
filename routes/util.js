var queryString = require("querystring");
var httpRequest = require("request");
var promise = require("promise");
var http = require("http");
var DBConn = require("tedious").Connection;
var DBReq = require("tedious").Request;
var tediousDB = require("tedious");
var sendgrid = require("sendgrid")(
  "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"
);
var crypto = require("crypto");

var ping = require("ping");

var mssql = require("mssql");

//var oracledb = require("oracledb");

var version = "Admin 3.7.7";

result = {
  resCode: 0,
  resMsg: "Success",
  resData: [],
};

var config = {
  userName: process.env.SQL_USER, // update me
  password: process.env.SQL_PASSWORD, // update me
  server: process.env.SQL_SERVER, // update me
  options: {
    database: process.env.SQL_DATABASE, //update me
    encrypt: process.env.SQL_ENCRYPT,
  },
};

var sql = "select top 5 * from user_log ";
var sql2 =
  "insert into user_log(user_id , user_svc , user_key , user_value , time_ts) values('" +
  "111" +
  "','" +
  "u_svc" +
  "','" +
  "u_key" +
  "','" +
  "u_val" +
  "',getdate()) ";

var app_environment = process.env["APP_ENVIRONMENT"];

module.exports = {
  getEnvironment: function getEnvironment() {},

  checkAuthKey: function checkAuthKey(auth_mode, auth_val) {
    let verify_flag = 0;
    if (auth_mode == "1") {
      if (
        auth_val ==
        "G2QouWbNmvDHT2zsLcW97hKuKHaf4XHhvCpM9zW8R6PREBANWgU2LQVl3X6cuE1j"
      ) {
        verify_flag = 1;
      }
    } else {
      verify_flag = 0;
    }
    return verify_flag;
  },

  querynewDB: async function querynewDB(sql) {
    return new promise(function (fulfill, reject) {
      var connection = new DBConn(config);
      result = "test";

      connection.on("connect", function (err) {
        if (err) {
          console.log(err);
          result["resCode"] = -1;
          result["resMsg"] = err;
          reject(err);
        } else {
          msg = ",";

          let results = [];

          request = new DBReq(sql, function (err, rowCount, rows) {
            console.log("5. " + rowCount + " row(s) found");
            //console.log(msg.length);

            //console.log(JSON.stringify( results) )

            connection.close();

            fulfill('{"results":' + JSON.stringify(results) + "}");
          });

          request.on("row", function (columns) {
            result = {};
            // Cut the last character out
            //msg = msg.substring(1, msg.length - 1)

            columns.forEach(function (column) {
              //msg = msg + column.metadata.colName + " " + column.value + "\n";
              msg =
                msg +
                '"' +
                column.metadata.colName +
                '":"' +
                column.value +
                '",\n';
              result[column.metadata.colName] = column.value;
            });
            results.push(result);
            // Cut the last character out
            //msg = msg.substring(1, msg.length - 1)
          });

          connection.execSql(request);
        }
      });
    });
  },

  querynewDB2: async function querynewDB2(config_in, sql, paramList) {
    return new promise(function (fulfill, reject) {
      console.log(JSON.stringify(paramList));

      var connection = new DBConn(config_in);
      result = "test";

      connection.on("connect", function (err) {
        if (err) {
          console.log(err);
          result["resCode"] = -1;
          result["resMsg"] = err;
          reject(err);
        } else {
          msg = ",";

          let results = [];

          request = new DBReq(sql, function (err, rowCount, rows) {
            console.log("5. " + rowCount + " row(s) found");
            //console.log(msg.length);

            //console.log(JSON.stringify( results) )

            connection.close();

            fulfill(
              '{"results":' +
                JSON.stringify(results) +
                ', "row":' +
                rowCount +
                ',"message":"' +
                err +
                '"}'
            );
          });

          let param_ind = paramList.length;
          for (let i = 0; i < param_ind; i++) {
            if (paramList[i]["type"] == "C") {
              request.addParameter(
                paramList[i]["name"],
                tediousDB.TYPES.NVarChar,
                paramList[i]["value"]
              );
            } else if (paramList[i]["type"] == "I") {
            }
          }

          request.on("row", function (columns) {
            result = {};
            // Cut the last character out
            //msg = msg.substring(1, msg.length - 1)

            columns.forEach(function (column) {
              //msg = msg + column.metadata.colName + " " + column.value + "\n";
              msg =
                msg +
                '"' +
                column.metadata.colName +
                '":"' +
                column.value +
                '",\n';
              result[column.metadata.colName] = column.value;
            });
            results.push(result);
            // Cut the last character out
            //msg = msg.substring(1, msg.length - 1)
          });

          connection.execSql(request);
        }
      });
    });
  },

  queryDB: function queryDB(config, sql) {
    var connection = new DBConn(config);
    connection.on("connect", function (err) {
      if (err) {
        console.log(err);
        result["resCode"] = -1;
        result["resMsg"] = err;
      } else {
        msg = ",";
        request = new DBReq(sql, function (err, rowCount, rows) {
          console.log("5. " + rowCount + " row(s) found");
          //console.log(msg.length);
          msg = msg.substring(1, msg.length - 1);
          console.log(msg);

          connection.close();
        });

        request.on("row", function (columns) {
          // Cut the last character out
          //msg = msg.substring(1, msg.length - 1)

          columns.forEach(function (column) {
            //msg = msg + column.metadata.colName + " " + column.value + "\n";
            msg =
              msg +
              '"' +
              column.metadata.colName +
              '":"' +
              column.value +
              '",\n';
          });
          // Cut the last character out
          //msg = msg.substring(1, msg.length - 1)
        });

        connection.execSql(request);
      }

      return result;
    });
  },

  execDB: function execDB(config, sql) {
    var connection = new DBConn(config);
    connection.on("connect", function (err) {
      if (err) {
        console.log(err);
        result["resCode"] = -1;
        result["resMsg"] = err;
      } else {
        msg = ",";
        request = new DBReq(sql, function (err, rowCount, rows) {
          msg = rowCount + " row(s) found";
          console.log(msg);

          connection.close();
        });

        request.on("row", function (columns) {
          // Cut the last character out
          //msg = msg.substring(1, msg.length - 1)

          columns.forEach(function (column) {
            //msg = msg + column.metadata.colName + " " + column.value + "\n";
            msg =
              msg +
              '"' +
              column.metadata.colName +
              '":"' +
              column.value +
              '",\n';
          });
          // Cut the last character out
          //msg = msg.substring(1, msg.length - 1)
        });

        connection.execSql(request);
      }

      return result;
    });
  },

  logDB: function logDB(u_id, u_svc, u_key, u_val) {
    var sql_log =
      "insert into user_log(user_id , user_svc , user_key , user_value , time_ts) values('" +
      u_id +
      "','" +
      u_svc +
      "','" +
      u_key +
      "','" +
      u_val +
      "',getdate()) ";

    this.execDB(config, sql_log);
  },
  ///////////////////////////////////////////////////////////////////////////////

  nodeText: function nodeText(text) {
    const data = {
      node_type: "node",
      nodeResponse: {
        type: "text",
        response: text,
      },
    };
    return data;
  },

  nodeImage: function nodeImage(image) {
    const data = {
      node_type: "node",
      nodeResponse: {
        type: "image",
        response: image,
      },
    };
    return data;
  },

  nodeAudio: function nodeAudio(audio) {
    const data = {
      node_type: "node",
      nodeResponse: {
        type: "audio",
        response: audio,
      },
    };
    return data;
  },

  nodeVideo: function nodeVideo(video) {
    const data = {
      node_type: "node",
      nodeResponse: {
        type: "video",
        response: video,
      },
    };
    return data;
  },

  nodeFile: function nodeFile(file) {
    const data = {
      node_type: "node",
      nodeResponse: {
        type: "file",
        response: file,
      },
    };
    return data;
  },

  nodeSetAttrb: function nodeSetAttrb(attb_name, attb_val) {
    const data = {
      node_type: "set_attr",
      todo: [
        {
          attr_name: attb_name,
          attr_value: attb_val,
        },
      ],
    };

    return data;
  },

  calcCrow: function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  },

  copyObject: function copyObject(obj1, obj2) {
    for (var keys = Object.keys(obj1), l = keys.length; l; --l) {
      obj2[keys[l - 1]] = obj1[keys[l - 1]];
    }
    return obj2;
  },
  // Converts numeric degrees to radians

  md5Text: function md5Text(str) {
    var md5sum = crypto.createHash("md5");

    //            console.log (str)

    md5sum.update(str);

    //           console.log (str)

    hashtext = md5sum.digest("hex");

    //           console.log ( hashtext )

    return hashtext;
  },

  getDateTime: function getDateTime(format_in) {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    if (format_in == "YYYYMMDD") {
      return year + month + day;
    } else if ((format_in = "YYYYMMDDHHMISS")) {
      return year + month + day + hour + min + sec;
    } else {
      return year + month + day;
    }
  },

  lineNotifyImg: function lineNotifyImg(grp_name, notify_txt, pic_url) {
    if (grp_name == "Network") {
      //Group Network
      token = "DzErot2lTgMoelDbeRCISKc0laSaGYOeLydcJXV10qN";
    } else if (grp_name == "MaxPOS") {
      //PT MAX POS
      token = "P5DhA9hNdbQiibwmNzemVoH1WL37bmkTJZKcigKU74N";
    } else if (grp_name == "Infra") {
      //PT MAX POS
      token = "yDUitO2yuYcHrBf9RPu3Qq1JsswV0GVkg6cBEzxtvZG";
    } else if (grp_name == "ChatBot") {
      //PT MAX POS
      token = "X3Rj17tiIXO9pmxfPJGbHD1ECadGNOWOo72rjZKggkO";
    } else if (grp_name == "LPR") {
      //PT MAX POS
      token = "m3hfueB2XUfi5EUYzHIycjNeqSnD3ZCBrQdOGzsVDzU";
    } else {
      // LPR
      //token = '9KazmqoasuGxm51sp7FLH8WxOKKRqAzz2kLQ37vOw04';

      token = "y5haoeG21MiEV0zGRWjBDqlYc9BR65uCrbanI1X1ess";
    }

    console.log("notify image");

    httpRequest(
      {
        method: "POST",
        uri: "https://notify-api.line.me/api/notify",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          bearer: token,
        },
        form: {
          message: notify_txt,
          imageThumbnail: pic_url,
          imageFullsize: pic_url,
        },
      },
      (err, httpResponse, body) => {
        if (err) {
          console.log("Image : " + err);
        } else {
          console.log("Image : Notify Success");
        }
      }
    );
  },

  lineNotify: function lineNotify(grp_name, notify_msg) {
    if (grp_name == "Network") {
      //Group Network
      token = "DzErot2lTgMoelDbeRCISKc0laSaGYOeLydcJXV10qN";
    } else if (grp_name == "MaxPOS") {
      //PT MAX POS
      token = "P5DhA9hNdbQiibwmNzemVoH1WL37bmkTJZKcigKU74N";
    } else if (grp_name == "Infra") {
      //PT MAX POS
      token = "yDUitO2yuYcHrBf9RPu3Qq1JsswV0GVkg6cBEzxtvZG";
    } else if (grp_name == "ChatBot") {
      //PT MAX POS
      token = "X3Rj17tiIXO9pmxfPJGbHD1ECadGNOWOo72rjZKggkO";
    } else if (grp_name == "ServiceDesk") {
      //PT MAX POS
      token = "WoHaIN9Cxse0zfvt2Yc1sW1oS8DtjFM47nMibDkavnh";
    } else if (grp_name == "SLA") {
      //PT MAX POS
      token = "OpL5C6zziu7kofDUTxrSgyQAxM5ARAY2Drze0VHmYKM";
    } else {
      // Leng
      token = "4i2IhTsLf6PSjp0e7r6NCtRAEoiD7wN06eSZVX7Kma3";
    }

    httpRequest(
      {
        method: "POST",
        uri: "https://notify-api.line.me/api/notify",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          bearer: token,
        },
        form: {
          message: notify_msg,
        },
      },
      (err, httpResponse, body) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Notify " + grp_name + "Success");
        }
      }
    );
  },

  newLineNotify: function newLineNotify(token, notify_msg) {
    httpRequest(
      {
        method: "POST",
        uri: "https://notify-api.line.me/api/notify",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        auth: {
          bearer: token,
        },
        form: {
          message: notify_msg,
        },
      },
      (err, httpResponse, body) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Notify Success");
        }
      }
    );
  },

  nodeFuelText: function nodeFuelText(text) {
    const data = { text: text };

    return data;
  },

  verify: function verify(code_in) {
    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;

    var day = date.getDate();

    var dayofweek = date.getDay();

    var v_month = "";

    if (month == 1) {
      v_month = "January";
    } else if (month == 2) {
      v_month = "February";
    } else if (month == 3) {
      v_month = "March";
    } else if (month == 4) {
      v_month = "April";
    } else if (month == 5) {
      v_month = "May";
    } else if (month == 6) {
      v_month = "June";
    } else if (month == 7) {
      v_month = "July";
    } else if (month == 8) {
      v_month = "August";
    } else if (month == 9) {
      v_month = "September";
    } else if (month == 10) {
      v_month = "October";
    } else if (month == 11) {
      v_month = "November";
    } else if (month == 12) {
      v_month = "December";
    }

    var v_day = "";
    if (dayofweek == 0) {
      v_day = "Sunday";
    } else if (dayofweek == 1) {
      v_day = "Monday";
    } else if (dayofweek == 2) {
      v_day = "Tuesday";
    } else if (dayofweek == 3) {
      v_day = "Wednesday";
    } else if (dayofweek == 4) {
      v_day = "Thursday";
    } else if (dayofweek == 5) {
      v_day = "Friday";
    } else if (dayofweek == 6) {
      v_day = "Saturday";
    }

    var code = v_day + "-" + day + "-" + v_month + "-" + year;

    console.log(code);

    return code;
  },
  getVersion: function getVersion() {
    return version;
  },

  getEncrypt: function getEncrypt(jsontxt_in) {
    let tmp = this.encrypt3DES(jsontxt_in, "Maxventures");
    return Buffer.from(tmp, "utf8").toString("hex");
  },
  getDecrypt: function getDecrypt(enctxt_in) {
    var tmp = Buffer.from(enctxt_in, "hex").toString("utf8");
    return this.decrypt3DES(tmp, "Maxventures");
  },

  LOGGING: function LOGGING(config_in, input_param) {
    var sql_log =
      "insert into webadmin_log(created_at , created_date,webfunction , param_in , message) values(dateadd(hour,7,getdate()) " +
      " , convert(varchar(10),dateadd(hour,7,getdate()),112) , @func_in , @param_in , @msg_in ) ";

    this.querynewDB2(config_in, sql_log, input_param).then(function (datax) {
      console.log(datax);
    });
    return;
  },

  encrypt3DES: function encrypt3DES(data, key) {
    const md5Key = crypto
      .createHash("md5")
      .update(key)
      .digest("hex")
      .substr(0, 24);
    const cipher = crypto.createCipheriv("des-ede3", md5Key, "");

    let encrypted = cipher.update(data, "utf8", "base64");
    encrypted += cipher.final("base64");
    return encrypted;
  },

  decrypt3DES: function decrypt3DES(data, key) {
    let encrypted;
    try {
      const md5Key = crypto
        .createHash("md5")
        .update(key)
        .digest("hex")
        .substr(0, 24);
      const decipher = crypto.createDecipheriv("des-ede3", md5Key, "");

      encrypted = decipher.update(data, "base64", "utf8");
      encrypted += decipher.final("utf8");
    } catch (e) {
      return "Error";
    }
    return encrypted;
  },
};

function toRad(Value) {
  return (Value * Math.PI) / 180;
}
