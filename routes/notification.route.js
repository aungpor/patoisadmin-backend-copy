"use strict"

const express = require('express');
const router = express.Router();
const notificationService = require('../services/notifcation.service');
const verify = require("../middleware/verifyToken");

router.get("/user-id/:userId", notificationService.getNotificationByuserIdService);
router.get("/user-tel/:userTel", notificationService.getNotificationByUserTelService);
router.get("/maxcard-id/:maxcardId", notificationService.getNotificationByMaxcardIdService);
router.delete("/:notificationId", notificationService.deleteNotificationService);

module.exports = router;