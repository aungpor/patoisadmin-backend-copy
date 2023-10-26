"use strict";
const axios = require('axios');
const util = require('../routes/util');
const db = require('../db.config');
const crypto = require('../utils/crypto');
const qrcodeUtil = require('../utils/qrcode');
const campaign_user = db.campaign_user;
const campaign = db.campaign;
const patois_url = process.env.PATOIS_URL;
// const front_patois_url = process.env.APP_ENVIRONMENT == 'Production' ? 'https://liff.line.me/1656700283-V5eN4MYk?liff.state=/?' : 'https://liff.line.me/1656686878-Vg9Jrdm2?liff.state=/?'
// const front_patois_url = process.env.APP_ENVIRONMENT == 'Production' ? 'https://patois.pt.co.th' : 'https://uat-patois-app-asv.azurewebsites.net'
const front_patois_url = process.env.APP_ENVIRONMENT == 'Production' ? 'https://patois.com/campaign?' : 'https://uat-patois.pt.co.th/campaign?'

async function getCampaignUser(req, res) {
    let response;
    try {
        response = await campaign_user.findAll();

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getCampaignUserByCampaignId(req, res) {
    let campaignId = req.params.id;
    let response;
    try {
        response = await campaign_user.findAll({
            where: {
                campaign_id: campaignId
            },
            order: [['campaign_user_id', 'DESC']]
        });
        // console.log("response: ", response);
        if (response.length != 0) {
            response = await Promise.all(response.map(async element => {
                let qrcode = "";
                qrcode = await qrcodeUtil.generateQrCode(element.campaign_url);
                element.dataValues.qrcode = qrcode;
                return element;
            }));
        }
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {

        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getCampaignUserByCampaignUserId(req, res) {
    let campaignUserId = req.params.id;
    let response;
    try {
        response = await campaign_user.findOne({
            where: {
                campaign_user_id: campaignUserId
            },
            order: [['campaign_user_id', 'DESC']]
        });
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {

        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function createCampaignUser(req, res) {
    let data = req.body;
    console.log("createCampaignUser data: ", data);
    let response;
    try {
        let campaignData = await campaign.findOne({
            where: {
                campaign_id: data.campaign_id
            }
        });

        console.log("campaignData: ", campaignData);

        data.campaign_code = campaignData.campaign_code

        if (!data || !data.ref_code || !data.campaign_code) res.status(400).send({ ResponseCode: 400, ResponseMsg: "data do not exist", data: null });

        let generatedData = await generateUrl(data);
        console.log("generatedData: ", generatedData);
        data.campaign_url = generatedData.data.campaign_url;
        data.encrypted_ref_code = generatedData.data.encrypted_ref_code;
        data.encrypted_campaign_code = generatedData.data.encrypted_campaign_code;
        response = await campaign_user.create(data);
        console.log("createCampaignUser response: ", JSON.stringify(response));
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });

    } catch (error) {

        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function editCampaginUser(req, res) {
    let request = req.body;
    let response;
    let dataBeforeUpdated;
    try {
        if (!request || !request.campaign_user_id) {
            res.send({ ResponseCode: 400, ResponseMsg: "request is empty", data: {} });
        }

        dataBeforeUpdated = await campaign_user.findOne({
            where: {
                campaign_user_id: request.campaign_user_id
            }
        })

        dataBeforeUpdated.active = request.active;
        response = await dataBeforeUpdated.save();

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {

        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function deleteCampaginUserByCampignUserId(req, res) {
    try {
        console.log("deleteCampaginUser: ");
        let id = req.params.id;
        console.log("id: ", id);
        let response;
        response = await campaign_user.destroy({
            where: {
                campaign_user_id: id
            }
        });

        console.log("response: ", response);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });

    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function deleteCampaigUsernByCampaignId(campaignId) {
    console.log("deleteCampaginUser: ");
    console.log("campaignId: ", campaignId);
    let response;
    try {
        response = await campaign_user.destroy({
            where: {
                campaign_id: campaignId
            }
        });

        console.log("response: ", response);
        return { ResponseCode: 200, ResponseMsg: "success", data: response };

    } catch (error) {
        return { ResponseCode: 400, ResponseMsg: error.message, data: null };
    }
}

async function generateUrl(data) {
    console.log("data: ", data);
    let response = {};
    try {
        if (!data || !data.ref_code || !data.campaign_code) return { ResponseCode: 400, ResponseMsg: "data do not exist", data: {} }

        response.encrypted_ref_code = crypto.AES_encrypt(data.ref_code);
        response.encrypted_campaign_code = crypto.AES_encrypt(data.campaign_code);


        response.encrypted_ref_code = encodeURIComponent(response.encrypted_ref_code);
        response.encrypted_campaign_code = encodeURIComponent(response.encrypted_campaign_code);

        //prd 3.7.5 edit endpoint
        response.campaign_url = front_patois_url
            + "page_type=register"
            + "&ref_type=scanQR"
            + "&ref_code=" + response.encrypted_ref_code
            + "&campaign_code=" + response.encrypted_campaign_code

        // response.campaign_url = front_patois_url
        //     + "/menu/campaign?page_type=register"
        //     + "&ref_type=scanQR"
        //     + "&ref_code=" + response.encrypted_ref_code
        //     + "&campaign_code=" + response.encrypted_campaign_code

        return { ResponseCode: 200, ResponseMsg: "success", data: response };

    } catch (error) {
        return { ResponseCode: 400, ResponseMsg: error.message, data: null };
    }
}

async function getCampaignUserByPage(req, res) {
    let request = req.query
    let response;
    let allCampainUser
    try {
        allCampainUser = await campaign_user.findAll({
            where: {
                campaign_id: request.campaignId
            }
        });

        response = await campaign_user.findAll({
            where: {
                campaign_id: request.campaignId
            },
            order: [['campaign_user_id', 'DESC']],
            offset: (parseInt(request.pageNumber) - 1) * parseInt(request.rowsOfPage),
            limit: parseInt(request.rowsOfPage)
        });
        console.log("response: ", response);
        if (response.length != 0) {
            response = await Promise.all(response.map(async element => {
                let qrcode = "";
                qrcode = await qrcodeUtil.generateQrCode(element.campaign_url);
                element.dataValues.qrcode = qrcode;
                return element;
            }));
        }
        res.send({ ResponseCode: 200, ResponseMsg: "success", total: allCampainUser.length, data: response, test: "aungpor" });
    } catch (error) {

        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null, test: "aungpor" });
    }
}

module.exports = {
    getCampaignUser,
    getCampaignUserByCampaignId,
    getCampaignUserByCampaignUserId,
    createCampaignUser,
    editCampaginUser,
    deleteCampaginUserByCampignUserId,
    deleteCampaigUsernByCampaignId,
    getCampaignUserByPage
}
