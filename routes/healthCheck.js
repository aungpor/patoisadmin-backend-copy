var express = require("express");
var router = express.Router();

router.get("/", function (req, res, next) {
    let dt = new Date()
    res.send(dt)
  } )


module.exports = router;
