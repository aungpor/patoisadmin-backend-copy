"use strict"

const express = require('express');
const router = express.Router();
const campaignPointService = require('../services/camapaign-point.service');

router.get("/", campaignPointService.getAllCampaignPoint);
router.post("/", campaignPointService.addCampaignPoint);
router.put("/", campaignPointService.editCamapginPoint);
router.delete("/:id", campaignPointService.deleteCampaignPointByCamapaignPointId);
router.post("/point", campaignPointService.getCurrentPoint);

module.exports = router;