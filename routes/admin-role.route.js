"use strict";

const express = require('express');
const router = express.Router();
const adminRoleService = require('../services/admin-role.service');
const verify = require("../middleware/verifyToken");

router.get("/", verify("role",["read"]), adminRoleService.getRole)
router.get("/getRoleById/:id", verify("role",["read"]), adminRoleService.getRoleById)
router.get("/getRoleByName/:name", verify("role",["read"]), adminRoleService.getRoleByName)
router.post("/addRole", verify("role",["write"]), adminRoleService.addRole)
router.get("/getUserRole/:userId", verify("role",["read"]),adminRoleService.getUserRole)
router.get("/getPermissionByRoleId/:id", verify("role",["read"]), adminRoleService.getPermissionByRoleId)
router.post("/assignRolePermission", verify("role",["write"]), adminRoleService.assignRolePermission)
router.put("/editRolePermission", verify("role",["edit"]), adminRoleService.editRolePermission)
router.put("/editRole", verify("role",["edit"]), adminRoleService.editRole)
router.post("/assignUserRole", verify("role",["write"]), adminRoleService.assignUserRole)
router.put("/editAssignRole", verify("role",["edit"]), adminRoleService.editAssignRole)
router.get("/checkAssignRole", verify("role",["read"]), adminRoleService.checkAssignRole)
router.put("/deleteRole", verify("role",["edit"]), adminRoleService.deleteRole)
router.put("/deleteAssignRole", verify("role",["edit"]), adminRoleService.deleteAssignRole)
router.get("/checkRolePermission", verify("role",["read"]), adminRoleService.checkRolePermission)
router.get("/checkDeleteAssignRole", verify("role",["read"]), adminRoleService.checkDeleteAssignRole)

router.get("/getAllPermission", adminRoleService.getAllPermission)
router.get("/getPermissionGroup", adminRoleService.getPermissionGroup)
router.get("/getPermissionByUserId/:id", adminRoleService.getPermissionByUserId)
router.get("/getApiPermissionByUserId/:id", adminRoleService.getApiPermissionByUserId)

module.exports = router
