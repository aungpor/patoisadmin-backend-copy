"use strict"

const express = require('express');
const router = express.Router();
const campaignService = require('../services/campaign.service');
const verify = require("../middleware/verifyToken");

router.get("/", campaignService.getCampaign);
router.get("/:id", campaignService.getCampaignByCampaignId);
router.post("/", campaignService.createCampaign);
router.put("/", campaignService.editCampagin);
router.delete("/:id", campaignService.deleteCampaignByCamapaignId);

module.exports = router;