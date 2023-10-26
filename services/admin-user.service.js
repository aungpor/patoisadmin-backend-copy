"use strict";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken")
const db = require('../db.config');
const admin_user = db.admin_user;
const assign_role = db.assign_role

async function getUser(req, res) {
    let response;
    try {
        response = await admin_user.findAll({
            order: [['user_id', 'DESC']],
        });
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getUserById(req, res) {
    let userId = req.params.id
    let response;
    try {
        response = await admin_user.findOne({
            where: {
                user_id: userId
            },
            order: [['user_id', 'DESC']],
        });

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getActiveUserByEmail(req, res) {
    let user_email = req.params.userEmail;
    let response;
    try {
        response = await admin_user.findOne({
            where: {
                user_email: user_email,
                active: 1
            },
        });

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function addUser(req, res) {
    let request = {};
    let response;
    try {
        request.user_name = req.body.user_name;
        request.user_email = req.body.user_email;
        request.active = req.body.active;
        console.log("request: ", JSON.stringify(request));

        response = await admin_user.create(request);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getUserByPage(req, res) {
    let request = req.query
    let response;
    let allUser;
    try {
        response = await admin_user.findAll({
            order: [['user_id', 'DESC']],
            offset: (parseInt(request.pageNumber) - 1) * parseInt(request.rowsOfPage),
            limit: parseInt(request.rowsOfPage),
            where: {
                active: 1
            },
        });

        allUser = await admin_user.findAll({
            where: {
                active: 1
            },
        });

        res.send({ ResponseCode: 200, ResponseMsg: "success", total: allUser.length, data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getInactiveUserByPage(req, res) {
    let request = req.query
    let response;
    let allUser;
    try {
        response = await admin_user.findAll({
            order: [['user_id', 'DESC']],
            offset: (parseInt(request.pageNumber) - 1) * parseInt(request.rowsOfPage),
            limit: parseInt(request.rowsOfPage),
            where: {
                active: 0
            },
        });

        allUser = await admin_user.findAll({
            where: {
                active: 0
            },
        });

        res.send({ ResponseCode: 200, ResponseMsg: "success", total: allUser.length, data: response });
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

async function createToken(req, res) {
    let request = {};
    let response;
    try {
        request.user_id = req.body.user_id
        request.user_name = req.body.user_name
        request.user_email = req.body.user_email
        request.permission = req.body.permission
        console.log("request: ", JSON.stringify(request));

        const accessToken = jwt.sign(
            { user_id: request.user_id, user_name: request.user_name, user_email: request.user_email, permission: request.permission },
            "ACCESS_TOKEN_SECRET",
            { expiresIn: '15m', algorithm: "HS256" }
        )

        const refreshToken = jwt.sign(
            { user_id: request.user_id, user_name: request.user_name, user_email: request.user_email, permission: request.permission },
            "REFRESH_TOKEN_SECRET",
            { algorithm: "HS256" }
        )

        // response = await admin_user.create(request);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response, accessToken: accessToken, refreshToken: refreshToken });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function refreshToken(req, res) {
    let request = {};
    let response;
    try {
        request.user_id = req.body.user_id
        request.user_name = req.body.user_name
        request.user_email = req.body.user_email
        request.permission = req.body.permission
        console.log("request: ", JSON.stringify(request));

        const accessToken = jwt.sign(
            { user_id: request.user_id, user_name: request.user_name, user_email: request.user_email, permission: request.permission },
            "ACCESS_TOKEN_SECRET",
            { expiresIn: '15m', algorithm: "HS256" }
        )

        const refreshToken = jwt.sign(
            { user_id: request.user_id, user_name: request.user_name, user_email: request.user_email, permission: request.permission },
            "REFRESH_TOKEN_SECRET",
            { algorithm: "HS256" }
        )

        // response = await admin_user.create(request);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response, accessToken: accessToken, refreshToken: refreshToken });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function checkToken(req, res) {
    let request = {};
    let token = req.headers.token;
    let refreshToken = req.headers.refreshtoken;
    try {
        jwt.verify(token, "ACCESS_TOKEN_SECRET", (err, decoded) => {
            if (err) {
                jwt.verify(refreshToken, "REFRESH_TOKEN_SECRET", (err, user) => {
                    if (err) {
                        res.status(403).json("Token is not valid!");
                    }
                    else {
                        //ตรงนี้ refresh และส่ง token ตัวใหม่ไป
                        request.user_id = req.body.user_id
                        request.user_name = req.body.user_name
                        request.user_email = req.body.user_email
                        request.permission = req.body.permission
                        console.log("request: ", JSON.stringify(request));

                        const accessToken = jwt.sign(
                            { user_id: request.user_id, user_name: request.user_name, user_email: request.user_email, permission: request.permission },
                            "ACCESS_TOKEN_SECRET",
                            { expiresIn: '15m', algorithm: "HS256" }
                        )

                        const refreshToken = jwt.sign(
                            { user_id: request.user_id, user_name: request.user_name, user_email: request.user_email, permission: request.permission },
                            "REFRESH_TOKEN_SECRET",
                            { algorithm: "HS256" }
                        )
                        res.send({ ResponseCode: 200, ResponseMsg: "refresh token success", accessToken: accessToken, refreshToken: refreshToken });
                    }
                });
            }
            else {
                res.send({ ResponseCode: 200, ResponseMsg: "success" });
            }
        })

    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function editUser(req, res) {
    let request = req.body;
    let response;
    try {
        console.log("request: ", JSON.stringify(request));

        if (!request || !request.user_id) {
            res.send({ ResponseCode: 400, ResponseMsg: "request is wrong or empty", data: {} });
        }

        await admin_user.update(
            { user_email: request.newEmail, user_name: request.newName, active: request.active },
            { where: { user_id: request.user_id } }
        );

        response = await admin_user.findOne(
            { where: { user_id: request.user_id } }
        );

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function deleteUser(req, res) {
    let request = req.body;
    let response;
    try {
        console.log("request: ", JSON.stringify(request));

        if (!request || !request.user_id) {
            res.send({ ResponseCode: 400, ResponseMsg: "request is wrong or empty", data: {} });
        }

        await assign_role.update(
            { active: 0 },
            { where: { user_id: request.user_id } }
        );

        response = await admin_user.update(
            { active: 0 },
            { where: { user_id: request.user_id } }
        );

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getInActiveUserByEmail(req, res) {
    let user_email = req.params.userEmail;
    let response;
    try {
        response = await admin_user.findOne({
            where: {
                user_email: user_email,
                active: 0
            },
        });

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function searchUser(req, res) {
    let request = req.query
    let response;
    let allUser;
    try {
        response = await admin_user.findAll({
            order: [['user_id', 'DESC']],
            offset: (parseInt(request.pageNumber) - 1) * parseInt(request.rowsOfPage),
            limit: parseInt(request.rowsOfPage),
            where: {
                [Op.and]:[
                    {
                        [Op.or]: [
                            {
                                user_name: {
                                    [Op.like]: `%${request.search}%`, // ค้นหาทุกตัวอักษร ไม่สนใจตัวพิมพ์เล็ก/ใหญ่
                                },
                            },
                            {
                                user_email: {
                                    [Op.like]: `%${request.search}%`,
                                },
                            }
                            
                        ],
                    },
                    {
                        active: 1
                    }
                ]
            },
        });

        allUser = await admin_user.findAll({
            where: {
                [Op.and]:[
                    {
                        [Op.or]: [
                            {
                                user_name: {
                                    [Op.like]: `%${request.search}%`, // ค้นหาทุกตัวอักษร ไม่สนใจตัวพิมพ์เล็ก/ใหญ่
                                },
                            },
                            {
                                user_email: {
                                    [Op.like]: `%${request.search}%`,
                                },
                            }
                            
                        ],
                    },
                    {
                        active: 1
                    }
                ]
            },
        });

        res.send({ ResponseCode: 200, ResponseMsg: "success", total: allUser.length, data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getRoleByUserId(req, res) {
    let userId = req.params.id
    let response
    try {
        response = await assign_role.findAll({
            order: [['user_id', 'DESC']],
            where: {
                user_id: userId,
                active: 1
            }
        });

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

module.exports = {
    getUser,
    getUserById,
    getActiveUserByEmail,
    addUser,
    getUserByPage,
    getPermissionByUserId,
    createToken,
    refreshToken,
    checkToken,
    getInactiveUserByPage,
    editUser,
    deleteUser,
    getInActiveUserByEmail,
    searchUser,
    getRoleByUserId
}