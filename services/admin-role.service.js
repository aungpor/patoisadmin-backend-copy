"use strict";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const db = require('../db.config');
const admin_role = db.admin_role;
const assign_role = db.assign_role
const admin_permission = db.admin_permission;
const role_permission = db.role_permission
const permission_group = db.admin_permission_group

async function getRole(req, res) {
    let response;
    try {
        response = await admin_role.findAll({
            where: {
                active: 1
            },
            order: [['role_id', 'DESC']],
        });
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getRoleById(req, res) {
    let roleId = req.params.id
    let response;
    try {
        response = await admin_role.findOne({
            where: {
                role_id: roleId
            },
            order: [['role_id', 'DESC']],
        });

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function addRole(req, res) {
    let request = {};
    let response;
    try {
        request.role_name = req.body.role_name;
        request.active = req.body.active;
        console.log("request: ", JSON.stringify(request));

        response = await admin_role.create(request);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getUserRole(req, res) {
    let userId = req.params.userId
    let assignRole;
    let userRole
    try {
        assignRole = await assign_role.findAll({
            where: {
                user_id: userId,
                active: 1
            },
            order: [['user_id', 'DESC']],
        });

        let allRole = []

        for (const role of assignRole) {
            userRole = await admin_role.findOne({
                where: {
                    role_id: role.role_id
                }
            });

            allRole = [...allRole, userRole]
        }

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: allRole });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getAllPermission(req, res) {
    let response;
    try {
        response = await admin_permission.findAll({
            where: {
                active: 1
            },
            order: [['permission_code', 'ASC']],
        });
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getPermissionByRoleId(req, res) {
    let roleId = req.params.id
    let response;
    try {
        const [results, metadata] = await db.sequelize.query(`
        SELECT r.role_id, r.permission_id, p.permission_name, r.active
FROM dbo.admin_role_permission r
LEFT JOIN dbo.admin_permission p ON r.permission_id = p.permission_id
WHERE r.role_id = '${roleId}'
AND r.active = 1
        `);
        response = results;

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getPermissionByUserId(req, res) {
    let userId = req.params.id
    let allPermissionArray = []
    try {
        const [results, metadata] = await db.sequelize.query(`
            SELECT ar.user_id, ar.role_id, rp.permission_id, p.permission_code
    FROM dbo.[admin_assign_role] ar
    LEFT JOIN dbo.[admin_role_permission] rp ON ar.role_id = rp.role_id
	LEFT JOIN dbo.[admin_permission] p ON rp.permission_id = p.permission_id
	WHERE ar.user_id = '${userId}' AND ar.active = '1' AND rp.active = '1'
            `);

        for (const result of results) {
            if (!allPermissionArray.includes(result.permission_code)) {
                allPermissionArray.push(result.permission_code)
            }
        }
        console.log(req.headers);

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: allPermissionArray });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getApiPermissionByUserId(req, res) {
    let userId = req.params.id
    const userPermissionArray = []
    try {
        const [results, metadata] = await db.sequelize.query(`
            SELECT ar.user_id, ar.role_id, rp.permission_id, p.permission_code, p.permission_api
    FROM dbo.[admin_assign_role] ar
    LEFT JOIN dbo.[admin_role_permission] rp ON ar.role_id = rp.role_id
	LEFT JOIN dbo.[admin_permission] p ON rp.permission_id = p.permission_id
	WHERE ar.user_id = '${userId}' AND ar.active = '1' AND rp.active = '1'
            `);

        for (const result of results) {
            if (result.permission_api != null) {
                const tokenPermissionArray = JSON.parse(result.permission_api);
                console.log(tokenPermissionArray);

                tokenPermissionArray.map((tokenPermission) => {
                    if (userPermissionArray.some(permission => permission.name === tokenPermission.name)) {
                        userPermissionArray.map((permission) => {
                            if (permission.name == tokenPermission.name) {
                                permission.crud = [...new Set([...permission.crud, ...tokenPermission.crud])]
                            }
                        })
                    }
                    else{
                        userPermissionArray.push(tokenPermission)
                    }
                })
            }
        }

        console.log(req.headers);

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: userPermissionArray });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function assignRolePermission(req, res) {
    let request = {};
    let response;
    try {
        request.role_id = req.body.role_id;
        request.permission_id = req.body.permission_id;
        request.active = 1;
        console.log("request: ", JSON.stringify(request));

        response = await role_permission.create(request);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function editRolePermission(req, res) {
    let request = req.body;
    let response;
    let dataBeforeUpdated;
    try {
        console.log("request: ", JSON.stringify(request));

        if (!request) {
            res.send({ ResponseCode: 400, ResponseMsg: "request is wrong or empty", data: {} });
        }

        dataBeforeUpdated = await role_permission.findOne({
            where: {
                role_id: request.role_id,
                permission_id: request.permission_id
            }
        })

        dataBeforeUpdated.active = request.active
        response = await dataBeforeUpdated.save()
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function checkRolePermission(req, res) {
    let request = req.query
    let response;
    try {
        response = await role_permission.findOne({
            where: {
                role_id: request.roleId,
                permission_id: request.permissionId
            }
        });
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getRoleByName(req, res) {
    let roleName = req.params.name
    let response;
    try {
        response = await admin_role.findOne({
            where: {
                role_name: roleName,
                active: 1
            },
            order: [['role_name', 'DESC']],
        });

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function editRole(req, res) {
    let request = req.body;
    let response;
    let dataBeforeUpdated;
    try {
        console.log("request: ", JSON.stringify(request));

        if (!request || !request.role_id || !request.role_name || !request.active) {
            res.send({ ResponseCode: 400, ResponseMsg: "request is wrong or empty", data: {} });
        }

        dataBeforeUpdated = await admin_role.findOne({
            where: {
                role_id: request.role_id
            }
        })

        dataBeforeUpdated.role_id = request.role_id
        dataBeforeUpdated.role_name = request.role_name
        dataBeforeUpdated.active = request.active
        response = await dataBeforeUpdated.save()
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function assignUserRole(req, res) {
    let request = {};
    let response;
    try {
        request.user_id = req.body.user_id;
        request.role_id = req.body.role_id;
        request.active = req.body.active;
        console.log("request: ", JSON.stringify(request));

        response = await assign_role.create(request);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function editAssignRole(req, res) {
    let request = req.body;
    let response;
    let dataBeforeUpdated;
    try {
        console.log("request: ", JSON.stringify(request));

        if (!request || !request.user_id || !request.role_id || !request.active) {
            res.send({ ResponseCode: 400, ResponseMsg: "request is wrong or empty", data: {} });
        }

        dataBeforeUpdated = await assign_role.findOne({
            where: {
                user_id: request.user_id,
                role_id: request.role_id
            }
        })

        dataBeforeUpdated.active = request.active
        response = await dataBeforeUpdated.save()
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function checkAssignRole(req, res) {
    let request = req.query
    let response;
    try {
        response = await assign_role.findOne({
            where: {
                user_id: request.userId,
                role_id: request.roleId
            }
        });
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function deleteRole(req, res) {
    let request = req.body;
    let response;
    let dataBeforeUpdated;
    try {
        console.log("request: ", JSON.stringify(request));

        if (!request || !request.role_id) {
            res.send({ ResponseCode: 400, ResponseMsg: "request is wrong or empty", data: {} });
        }

        dataBeforeUpdated = await admin_role.findOne({
            where: {
                role_id: request.role_id
            }
        })

        dataBeforeUpdated.role_id = request.role_id
        dataBeforeUpdated.active = 0
        response = await dataBeforeUpdated.save()
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function deleteAssignRole(req, res) {
    let request = req.body;
    let response;
    try {
        console.log("request: ", JSON.stringify(request));

        if (!request || !request.role_id) {
            res.send({ ResponseCode: 400, ResponseMsg: "request is wrong or empty", data: {} });
        }

        response = await assign_role.update(
            { active: 0 },
            { where: { role_id: request.role_id } }
        );

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function checkDeleteAssignRole(req, res) {
    let request = req.query
    let response;
    try {
        response = await assign_role.findAll({
            where: {
                role_id: request.roleId,
                active: 1
            }
        });
        res.send({ ResponseCode: 200, ResponseMsg: "success", total: response.length, data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getPermissionGroup(req, res) {
    let response;
    try {
        response = await permission_group.findAll({
            where: {
                active: 1
            },
            order: [['permission_group_code', 'ASC']],
        });
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

module.exports = {
    getRole,
    getRoleById,
    addRole,
    getUserRole,
    getAllPermission,
    getPermissionByRoleId,
    assignRolePermission,
    editRolePermission,
    getRoleByName,
    editRole,
    assignUserRole,
    editAssignRole,
    checkAssignRole,
    deleteRole,
    getPermissionByUserId,
    deleteAssignRole,
    checkRolePermission,
    checkDeleteAssignRole,
    getPermissionGroup,
    getApiPermissionByUserId,
}