"use strict";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const db = require('../db.config');
const { getMaxcardByUserId, getMaxcardByUserTel, getMaxcardByMaxcardId } = require('./maxcard.service');
const user = db.user;

async function getManualUserProviderService(req, res) {
    try {
        let users;
        users = await user.findAll({
            where: {
                provider: "manual"
            },
            order: [["id", "desc"]]
        });

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: users });
    } catch (error) {
        console.log("getUserManualProvider error: ", error);
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }
}

async function getManualUserProviderByUserIdService(req, res) {
    try {
        let userId = req.params.id;
        console.log("userId: ", userId);
        let userObject;
        userObject = await user.findOne({
            where: {
                id: userId,
                provider: "manual"
            },
        });
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: userObject });
    } catch (error) {
        console.log("getUserManualProviderByUserIdService error: ", error);
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }
}

async function updateManualUser(req, res) {
    try {
        let request = req.body;
        let userBeforeUpdated;
        let response;
        if (request && request.id) {
            userBeforeUpdated = await user.findOne({
                where: {
                    id: request.id
                }
            })

            userBeforeUpdated.active = request.active;
            response = await userBeforeUpdated.save();
            res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
        } else {
            res.status(400).send({ ResponseCode: 400, ResponseMsg: "data do not exist", data: null })
        }

    } catch (error) {
        console.log("updateUser error: ", error);
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }
}

async function createManualUser(req, res) {
    try {
        console.log("req: ", req.body);
        let request = req.body;
        let response;

        request.line_id = "0";
        request.active = "1";
        request.tel = "";
        request.email = "mock@ptmock.com";
        request.groups_id = "2";
        request.provider = "manual";
        request.pdpa_id = 1;
        request.pdpa_version = "1.0.0.1";
        request.pdpa_isagree = true;

        response = await user.create(request);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        console.log("createUser error: ", error);
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }
}

async function getUserByUserId(req, res) {
    try {
        console.log("getUserByUserId",);
        let response = [];
        let userId = req.params.userId;
        console.log("userId: ", userId);
        let userResponse = await user.findAll({
            where: {
                id: userId,
                provider: { [Op.ne]: "manual" }
            }
        })
        console.log("userResponse: ", JSON.stringify(userResponse));

        if (userResponse) {
            let maxcardResponse = await getMaxcardByUserId(userId);
            // userResponse[0].setDataValue("patois_maxcard_no", "");
            if (maxcardResponse) {
                console.log("maxcardResponse: ", JSON.stringify(maxcardResponse));
                console.log("maxcardResponse.patois_maxcard_no: ", JSON.stringify(maxcardResponse.patois_maxcard_no));
                userResponse[0].tel = maxcardResponse.patois_tel ? maxcardResponse.patois_tel : null;
                userResponse[0].setDataValue("patois_maxcard_no", maxcardResponse.patois_maxcard_no ? maxcardResponse.patois_maxcard_no : "");

            }
        }

        response = userResponse
        console.log("response: ", JSON.stringify(response));
        console.log("getUserByUserId end",);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }

}

async function getUserByUserTel(req, res) {
    try {
        console.log("getUserByUserTel");
        let userTel = req.params.userTel;
        let response;
        let userResponse = [];
        let maxcardResponse = {};
        console.log("userTel: ", userTel);

        maxcardResponse = await getMaxcardByUserTel(userTel);
        if (maxcardResponse) {
            console.log("maxcardResponse: ", JSON.stringify(maxcardResponse));
            userResponse = await user.findAll({
                where: {
                    id: maxcardResponse.patois_user_id,
                    provider: { [Op.ne]: "manual" }
                }
            })
            if (userResponse) {
                console.log("userResponse: ", JSON.stringify(userResponse));
                userResponse[0].tel = maxcardResponse.patois_tel
                userResponse[0].setDataValue("patois_maxcard_no", maxcardResponse.patois_maxcard_no ? maxcardResponse.patois_maxcard_no : "");
            }
        }

        console.log("userResponse: ", JSON.stringify(userResponse));

        response = userResponse

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }

}

async function getUserByUsername(req, res) {
    try {
        console.log("getUserByUsername",);
        let response;
        let userResponse = [];
        let name = req.params.name;
        console.log("name: ", name);
        userResponse = await user.findAll({
            where: {
                name: {
                    [Op.like]: `%${name}%`
                },
                provider: { [Op.ne]: "manual" }
            },
            limit: 100
        })
        console.log("userResponse length: ", userResponse.length);
        console.log("userResponse: ", JSON.stringify(userResponse));
        if (userResponse) {
            userResponse = await Promise.all(userResponse.map(async element => {
                // element.setDataValue("patois_maxcard_no", "");
                let maxcardResponse = await getMaxcardByUserId(element.id);
                if (maxcardResponse) {
                    console.log("maxcardResponse: ", JSON.stringify(maxcardResponse));
                    element.tel = maxcardResponse.patois_tel;
                    element.setDataValue("patois_maxcard_no", maxcardResponse.patois_maxcard_no ? maxcardResponse.patois_maxcard_no : "");
                    return element
                } else {
                    return element
                }
            }))

        }

        response = userResponse

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }

}
async function getUserByMaxcardId(req, res) {
    try {
        console.log("getUserByMaxcardId");
        let maxcardId = req.params.maxcardId;
        let response;
        let userResponse = {};
        let maxcardResponse = {};
        console.log("maxcardId: ", maxcardId);

        maxcardResponse = await getMaxcardByMaxcardId(maxcardId);
        if (maxcardResponse) {
            console.log("maxcardResponse: ", JSON.stringify(maxcardResponse));
            userResponse = await user.findAll({
                where: {
                    id: maxcardResponse.patois_user_id,
                    provider: { [Op.ne]: "manual" }
                }
            })
            if (userResponse) {
                console.log("userResponse: ", JSON.stringify(userResponse));
                userResponse[0].tel = maxcardResponse.patois_tel;
                userResponse[0].setDataValue("patois_maxcard_no", maxcardResponse.patois_maxcard_no ? maxcardResponse.patois_maxcard_no : "");
            }
        }

        console.log("userResponse: ", JSON.stringify(userResponse));

        response = userResponse

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }

}

module.exports = {
    getManualUserProviderService,
    getManualUserProviderByUserIdService,
    updateManualUser,
    createManualUser,
    getUserByUserId,
    getUserByUserTel,
    getUserByUsername,
    getUserByMaxcardId
}