"use strict";

const express = require('express');
const router = express.Router();
const shopService = require('../services/shop.service');
const verify = require("../middleware/verifyToken");

router.get("/status/:status", shopService.getShopByShopStatus);
// router.get("/test", shopService.test);
router.put("/", shopService.updateShopByShopStatus)
router.put("/merge-shop", shopService.mergeShop)
router.post("/nearby", shopService.getShopByShopStatus);
router.put("/types", shopService.updateShopByShopStatus);
router.post("/report/shop-approval", shopService.getShopReport)
router.get("/getShopWithLocationByStatus/:status", shopService.getShopWithLocationByStatus)
router.get("/shopExportExcel/:status", shopService.shopExportExcel)

module.exports = router

