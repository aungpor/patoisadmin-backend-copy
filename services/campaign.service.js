"use strict";

const db = require('../db.config');
const campaign = db.campaign;
const campaignUserService = require('./campaign-user.serivce');

async function getCampaign(req, res) {
    let response;
    try {
        response = await campaign.findAll({
            order: [['campaign_id', 'DESC']],
        });
        // if (response.length) {
        //     response = response.map(element => {
        //         element.dataValues.active = element.dataValues.active === true ? 1 : 0
        //         return element
        //     });
        // }

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getCampaignByCampaignId(req, res) {
    let campaignId = req.params.id
    let response;
    try {
        response = await campaign.findAll({
            where: {
                campaign_id: campaignId
            },
            order: [['campaign_id', 'DESC']],
        });

        // if (response.length) {
        //     response = response.map(element => {
        //         element.dataValues.active = element.dataValues.active === true ? 1 : 0
        //         return element
        //     });
        // }


        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }

}

async function createCampaign(req, res) {
    let data = req.body;
    console.log("start data: ", JSON.stringify(data));
    let lastestCampaign;
    let response;
    try {
        data.campaign_code = "";
        data.active = 1;
        data.limit_promo_per_giver = 1000000;
        data.limit_promo_per_receiver = 1;
        data.limit_promo_per_campaign = 1000000;
        data.promo_point_code = null;

        response = await campaign.create(data);

        response.campaign_code = "C" + String(parseInt(response.campaign_id)).padStart(7, '0');
        response = await response.save();
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getLastestCampaignId() {
    let response;
    try {
        response = await campaign.findOne({
            order: [['campaign_id', 'DESC']],
        });

        if (response) {
            console.log("response.campaign_id: ", response.campaign_id);
            return { ResponseMsg: "success", data: response.campaign_id };
        } else {
            let campaign = await campaign.findAll();
            if (campaign.length == 0) {
                return { ResponseMsg: "", data: "0" };
            }
        }

    } catch (error) {
        return { ResponseMsg: error.message, data: null };
    }
}

async function editCampagin(req, res) {
    let request = req.body;
    let response;
    let dataBeforeUpdated;
    try {
        console.log("request: ", request);
        // if (!request || !request.campaign_id) {
        //     res.send({ ResponseCode: 400, ResponseMsg: "request is empty", data: null });
        // }

        dataBeforeUpdated = await campaign.findOne({
            where: {
                campaign_id: request.campaign_id
            }
        });
        console.log("request.active: ", request.active);
        console.log("request.campaign_start_date: ", request.campaign_start_date);
        console.log("dataBeforeUpdated.campaign_start_date: ", dataBeforeUpdated.campaign_start_date);
        dataBeforeUpdated.campaign_start_date = request.campaign_start_date;
        dataBeforeUpdated.campaign_end_date = request.campaign_end_date;
        dataBeforeUpdated.campaign_name = request.campaign_name;
        dataBeforeUpdated.campaign_desc = request.campaign_desc;
        dataBeforeUpdated.limit_promo_per_giver = request.limit_promo_per_giver;
        dataBeforeUpdated.limit_promo_per_receiver = request.limit_promo_per_receiver;
        dataBeforeUpdated.limit_promo_per_campaign = request.limit_promo_per_campaign;
        dataBeforeUpdated.promo_coupon_type = request.promo_coupon_type;
        dataBeforeUpdated.for_new_user_only = request.for_new_user_only;
        dataBeforeUpdated.campaign_noti_title = request.campaign_noti_title;
        dataBeforeUpdated.active = request.active;
        console.log("dataBeforeUpdated: ", dataBeforeUpdated);
        response = await dataBeforeUpdated.save();

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });

    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function deleteCampaignByCamapaignId(req, res) {
    console.log("deleteCampaignByCamapaignId: ");
    let id = req.params.id;
    console.log("id: ", id);
    let response;
    try {

        await campaignUserService.deleteCampaigUsernByCampaignId(id);

        response = await campaign.destroy({
            where: {
                campaign_id: id
            }
        });

        console.log("response: ", response);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });

    } catch (error) {

        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }

}




module.exports = {
    getCampaign,
    getCampaignByCampaignId,
    createCampaign,
    editCampagin,
    deleteCampaignByCamapaignId,
    getLastestCampaignId

}