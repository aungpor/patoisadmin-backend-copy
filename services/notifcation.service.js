"use strict";
const axios = require('axios');
const util = require('../routes/util');
const db = require('../db.config');
const { getMaxcardByUserTel, getMaxcardByMaxcardId } = require('./maxcard.service');
const patois_notification = db.patois_notification;
const patois_url = process.env.PATOIS_URL;

async function getNotificationByuserId(userId) {
    try {
        console.log("getNotificationByuserId",);
        let response;
        let notificationResponse = [];
        console.log("userId: ", userId);

        notificationResponse = await patois_notification.findAll({
            where: {
                withs: userId,
                // types: "report_admin_manual"
            },
            order: [["notifications_id", "desc"]]
        })
        response = notificationResponse;
        return response

    } catch (error) {
        throw error
    }
}

async function getNotificationByuserIdService(req, res) {
    try {
        console.log("getNotificationByuserId",);
        let response;
        let notificationResponse = [];
        let userId = req.params.userId;
        console.log("userId: ", userId);

        notificationResponse = await getNotificationByuserId(userId);
        response = notificationResponse;
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });

    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }
}

async function getNotificationByUserTelService(req, res) {
    try {
        console.log("getNotificationByUserTelService");
        let userTel = req.params.userTel;
        let response;
        let notificationResponse = [];
        let maxcardResponse = {};
        console.log("userTel: ", userTel);

        maxcardResponse = await getMaxcardByUserTel(userTel);
        if (maxcardResponse) {
            console.log("maxcardResponse: ", JSON.stringify(maxcardResponse));
            notificationResponse = await getNotificationByuserId(maxcardResponse.patois_user_id,)
        }

        console.log("notificationResponse: ", JSON.stringify(notificationResponse));

        response = notificationResponse;

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }
}

async function getNotificationByMaxcardIdService(req, res) {
    try {
        console.log("getNotificationByMaxcardId");
        let maxcardId = req.params.maxcardId;
        let response;
        let notificationResponse = [];
        let maxcardResponse = {};
        console.log("maxcardId: ", maxcardId);

        maxcardResponse = await getMaxcardByMaxcardId(maxcardId);
        if (maxcardResponse) {
            console.log("maxcardResponse: ", JSON.stringify(maxcardResponse));
            notificationResponse = await getNotificationByuserId(maxcardResponse.patois_user_id,)
        }

        console.log("notificationResponse: ", JSON.stringify(notificationResponse));

        response = notificationResponse;

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }
}


async function deleteNotificationService(req, res) {
    try {
        console.log("deleteNotification: ");
        let id = req.params.notificationId;
        console.log("id: ", id);
        let response;
        response = await patois_notification.destroy({
            where: {
                notifications_id: id
            }
        });

        console.log("response: ", response);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });

    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

module.exports = {
    getNotificationByuserIdService,
    deleteNotificationService,
    getNotificationByUserTelService,
    getNotificationByMaxcardIdService

}