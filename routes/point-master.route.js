"use strict"

const express = require('express');
const router = express.Router();
const pointMasterService = require('../services/point-master.service');

router.get("/", pointMasterService.getAllPointMaster);
router.post("/", pointMasterService.addPointMaster);
router.put("/", pointMasterService.editPointMaster);
router.delete("/:id", pointMasterService.deletePointMasterByPointMasterId)

module.exports = router