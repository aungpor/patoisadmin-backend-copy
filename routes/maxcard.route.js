"use strict"

const express = require('express');
const router = express.Router();
const maxcardService = require('../services/maxcard.service');

router.get("/:userId", maxcardService.getMaxcardByUserIdService);

module.exports = router;