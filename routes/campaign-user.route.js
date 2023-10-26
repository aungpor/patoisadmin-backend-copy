
const express = require('express');
const router = express.Router();
const campaignUser = require('../services/campaign-user.serivce');
const verify = require("../middleware/verifyToken");

router.get('/getCampaignUserByPage', campaignUser.getCampaignUserByPage);
router.get('/', campaignUser.getCampaignUser);
router.get('/:id', campaignUser.getCampaignUserByCampaignUserId);
router.get('/campaign-id/:id', campaignUser.getCampaignUserByCampaignId);
router.post('/', campaignUser.createCampaignUser);
router.put('/', campaignUser.editCampaginUser);
router.delete('/:id', campaignUser.deleteCampaginUserByCampignUserId);


module.exports = router;
