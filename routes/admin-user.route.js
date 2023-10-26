"use strict";

const express = require('express');
const router = express.Router();
const adminUserService = require('../services/admin-user.service');
const verify = require("../middleware/verifyToken");

router.get("/", verify("admin_user",["read"]), adminUserService.getUser)
router.get("/getUserById/:id", verify("admin_user",["read"]), adminUserService.getUserById)
router.get("/getUserByPage", verify("admin_user",["read"]), adminUserService.getUserByPage)
router.get("/getInactiveUserByPage", verify("admin_user",["read"]), adminUserService.getInactiveUserByPage)
router.get("/getPermissionByUserId/:id", verify("admin_user",["read"]), adminUserService.getPermissionByUserId)
router.put("/editUser", verify("admin_user",["edit"]), adminUserService.editUser)
router.put("/deleteUser", verify("admin_user",["edit"]), adminUserService.deleteUser)
router.get("/searchUser", verify("admin_user",["read"]), adminUserService.searchUser)
router.get("/getRoleByUserId/:id", adminUserService.getRoleByUserId)

router.get("/getActiveUserByEmail/:userEmail", adminUserService.getActiveUserByEmail)
router.get("/getInActiveUserByEmail/:userEmail", adminUserService.getInActiveUserByEmail)
router.post("/addUser", adminUserService.addUser)
router.post("/createToken", adminUserService.createToken)
router.post("/refreshToken", adminUserService.refreshToken)
router.post("/checkToken", adminUserService.checkToken)


module.exports = router
