"use strict";
const axios = require('axios');
const util = require('../routes/util');
const db = require('../db.config');
const maxcard = db.maxcard;
const patois_url = process.env.PATOIS_URL;


async function getMaxcardByUserIdService(req, res) {
    try {
        let userId = req.params.userId
        let response;
        response = await getMaxcardByUserId(userId);

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response })
    } catch (error) {
        console.log("error: ", error);
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }
}

async function getMaxcardByUserId(userId) {
    try {
        console.log("getMaxcardByUserId: ");
        console.log("userId: ", userId);
        let response;
        response = await maxcard.findOne({
            where: {
                patois_user_id: userId,
                patois_status: "Completed"
            }
        })

        return response
    } catch (error) {
        throw error
    }
}

async function getMaxcardByUserTel(userTel) {
    try {
        console.log("getMaxcardByUserTel: ");
        console.log("userTel: ", userTel);
        let response;
        response = await maxcard.findOne({
            where: {
                patois_tel: userTel,
                patois_status: "Completed"
            }
        })

        return response
    } catch (error) {
        throw error
    }
}
async function getMaxcardByMaxcardId(maxcardId) {
    try {
        console.log("getMaxcardByMaxcardId: ");
        console.log("maxcardId: ", maxcardId);
        let response;
        response = await maxcard.findOne({
            where: {
                patois_maxcard_no: maxcardId,
                patois_status: "Completed"
            }
        })

        return response
    } catch (error) {
        throw error
    }
}

module.exports = {
    getMaxcardByUserIdService,
    getMaxcardByUserId,
    getMaxcardByUserTel,
    getMaxcardByMaxcardId
}