/// Loading .env configuration

var dotenv = require("dotenv");
dotenv.config();

var promise = require("promise");
const {
  DefaultAzureCredential,
  ManagedIdentityCredential,
  EnvironmentCredential,
} = require("@azure/identity");

const { SecretClient } = require("@azure/keyvault-secrets");
const fileUpload = require("express-fileupload");
var session = require("express-session");
var cookieParser = require("cookie-parser");
var cors = require("cors");

var createError = require("http-errors");
var express = require("express");
var path = require("path");

var logger = require("morgan");

var util = require("./routes/util.js");
const { env } = require("process");
util.getEnvironment();
console.log("APP_ENVIRONMENT: ", process.env["APP_ENVIRONMENT"]);
console.log("PATOIS_URL: ", process.env["PATOIS_URL"]);

var app = express();

// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

var middleware = (req, res, next) => {
  res.setHeader('X-Frame-Option', 'deny');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', 'object-src \'none\'');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Expect-CT', 'enforce, max-age=86400');
  res.setHeader('Permission-Policy', 'fullscreen=(), geolocation=()');
  next();
}

app.use(middleware)

////////////////////////////////////////////////////////////////////////////////

console.log("1 : Start read configuration ");

getenvconfig().then(function (config_data) {
  //console.log("config is : ", JSON.stringify(process.env, null, 4));
  const db = require("./db.config");
  db.sequelize.sync({ force: false }).then(() => {
    console.log("db has connected");
  });

  var healthRouter = require("./routes/healthCheck")
  var shopRouter = require("./routes/inquiryshop");
  var userRouter = require("./routes/inquiryuser");
  var reviewRouter = require("./routes/inquiryReview");
  var delreviewRouter = require("./routes/deletereview");
  var merchantRouter = require("./routes/inquirymerchant");
  var mainRouter = require("./routes/index-main");
  var fraudRouter = require("./routes/inquiryfraud");
  var logRouter = require("./routes/inquirylog");
  var batchRouter = require("./routes/batchupload");
  var smsRouter = require("./routes/sms");

  // var usersRouter = require("./routes/users");
  var authRouter = require("./routes/auth");
  const shopApprovalRouter = require("./routes/shop.route");
  const userRouter2 = require("./routes/user.route");
  const campaignRouter = require("./routes/campaign.route");
  const campaignUserRouter = require("./routes/campaign-user.route");
  const maxcardRouter = require("./routes/maxcard.route");
  const notificationRouter = require("./routes/notification.route");
  const pointMasterRouter = require("./routes/point-master.route");
  const campaignPointRouter = require("./routes/campaign-point.route");
  const adminUserRouter = require("./routes/admin-user.route.js")
  const adminRoleRouter  =require("./routes/admin-role.route.js")

  // view engine setup
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "hbs");

  app.use(logger("dev"));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(express.static(path.join(__dirname, "public")));
  app.use(cors());

  app.use(
    session({
      secret: process.env.EXPRESS_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // set this to true on production
      },
    })
  );

  // app.use("/index-main", mainRouter);

  app.use(
    "/M1-Br2rvh55iHFl6dJ6Ph7j1cli68pmR8t01CMu4BzstpS6KuDd8AIgwjjdQqpRMpbC",
    shopRouter
  );
  app.use(
    "/M2-TyiiDw85ZRfUjyZq2hGQrcqnFhZ5oaxXnwQvyvhhyXpPfV9w7jWkEfH5amlwOWc4",
    userRouter
  );
  app.use(
    "/M3-zqyYCM08otSYjvuKJ3qDNLxr9UFw9dguefDn1IIeErpQEAd5QQZ8MV06kx2jINTk",
    reviewRouter
  );
  app.use(
    "/M4-KhRT7VLkJlSWrzXEdsRzTrUIsax95BF6id5TpnT7m4LuTG0KirKx0ckrqjjM9D1E",
    merchantRouter
  );
  app.use(
    "/M5-8ZGnvdvRhWIkYjr7JCW3xLBGr5CyKxxL3LbCbAhrLUtM9LGyzrCDfUR34rNKKEpH",
    delreviewRouter
  );
  app.use(
    "/M6-a2TWpv9gSA4bny7CKtf5LjZmGczTvyIEfqNIpxW8jATaBYreVwvbnEyMv2TSvHnv",
    fraudRouter
  );
  app.use("/M7-jZmGczTvyIEfqNIpxW8jATaBYreVwvbnEyMv2TSvHnv", logRouter);

  app.use("/healthCheck", healthRouter);
  app.use("/sms", smsRouter);
  app.use("/index-main", mainRouter);
  app.use("/batchupload", batchRouter);
  app.use("/auth", authRouter);

  app.use("/shop", shopApprovalRouter);
  app.use("/user", userRouter2);
  app.use("/campaign", campaignRouter);
  app.use("/campaign-user", campaignUserRouter);
  app.use("/maxcard", maxcardRouter);
  app.use("/notification", notificationRouter);
  app.use("/point-master", pointMasterRouter);
  app.use("/campaign-point", campaignPointRouter);
  app.use("/admin-user", adminUserRouter)
  app.use("/admin-role", adminRoleRouter)
});


console.log("---------------------------------");

//////////////////////////////////////////////////////////////////////////////////

async function getenvconfig() {
  var dotenv = require("dotenv");

  if (process.env.APP_ENVIRONMENT != "Local") {
    var config_url = await getSecretFromVault();
    console.log(config_url);

    let config_result = await getUrlConfig(config_url);

    //console.log("Config URL : " + config_result);
    const config1 = dotenv.parse(config_result);

    // Setting environment from configuration file
    Object.keys(config1).forEach(function (key) {
      if (!process.env.hasOwnProperty(key)) {
        process.env[key] = config1[key];
      }
    });

    let timerID = setTimeout(() => {
      console.log("time up");

      return "time up";
    }, 1000);
  } else {
    console.log("Local config");
    return "Local";
  }
}

async function getUrlConfig(config_url) {
  return new promise(function (fulfill, reject) {
    var request = require("request");

    let headers = {};

    let body = {};

    request.get(
      {
        url: config_url,
      },
      (err, res, body) => {
        if (body.indexOf("Error") > -1) {
          fulfill({});
        } else {
          fulfill(body);
        }
      }
    );
  });
}

async function getSecretFromVault() {
  return new promise(function (fulfill, reject) {
    var credential = "";
    //console.log(process.env["KEYVAULT_URL"]);
    if (process.env["APP_ENVIRONMENT"] == "Test") {
      credential = new EnvironmentCredential();
    } else {
      credential = new ManagedIdentityCredential();
    }

    //console.log(JSON.stringify(credential, null, 4));

    var url = process.env["URL_ENVIRONMENT"];
    var client = new SecretClient(url, credential);

    client
      .getSecret("env-" + process.env.APP_ENVIRONMENT)
      .then(function (data) {
        console.log("vault :" + data["value"]);
        fulfill(data["value"]);
      });
  });
}

module.exports = app;
