"use strict"

const express = require('express');
const router = express.Router();
const userService = require('../services/user.service');

router.get("/", userService.getManualUserProviderService);
router.get("/:id", userService.getManualUserProviderByUserIdService)
router.put("/", userService.updateManualUser);
router.post("/", userService.createManualUser);
router.get("/user-id/:userId", userService.getUserByUserId);
router.get("/user-tel/:userTel", userService.getUserByUserTel);
router.get("/name/:name", userService.getUserByUsername);
router.get("/maxcard-id/:maxcardId", userService.getUserByMaxcardId);

module.exports = router;