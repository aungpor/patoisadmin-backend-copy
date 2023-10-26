"use strict";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const axios = require('axios');
const moment = require('moment')
const db = require('../db.config');
const { getShopByShopIdService } = require("./shop.service");
const campaign_point = db.campaign_point;

async function getAllCampaignPoint(req, res) {
    console.log("getAllCampaignPoint start");
    let response = [];
    try {
        response = await campaign_point.findAll();

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response })
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function addCampaignPoint(req, res) {
    console.log("addCampaignPoint start");
    let request = {};
    let response;
    let dataBeforeAdded;
    try {
        request.campaign_id = req.body.campaign_id;
        request.campaign_sub_id = req.body.campaign_sub_id;
        request.point = req.body.point;
        request.point_type = req.body.point_type;
        request.is_default = req.body.is_default;
        request.active = req.body.active;
        request.start_date = moment(req.body.start_date, 'YYYY-MM-DD').format("YYYY-MM-DD HH:mm:ss");
        request.end_date = moment(req.body.end_date, 'YYYY-MM-DD')
            .add(59, 'seconds')
            .add(59, 'minutes')
            .add(23, 'hours')
            .format("YYYY-MM-DD HH:mm:ss");
        console.log("request: ", request);

        dataBeforeAdded = await campaign_point.findOne({
            where: {
                is_default: true,
                point_type: request.point_type
            }
        });

        if (dataBeforeAdded && request.point_type === true) {
            return res.status(400).send({ ResponseCode: 400, ResponseMsg: "cannot insert data because this point_type already has is_default == true", data: null })
        }

        let checkDateTimeRangeDupicate = await checkDateTimeRangeDupicateService(request.start_date, request.end_date, request.point_type, null);
        console.log("checkDateTimeRangeDupicate: ", checkDateTimeRangeDupicate);
        if (checkDateTimeRangeDupicate) {
            return res.status(400).send({ ResponseCode: 400, ResponseMsg: "date range dupicated", data: null })
        }

        console.log("request: ", request);
        response = await campaign_point.create(request);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });

    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function editCamapginPoint(req, res) {
    console.log("editCamapginPoint start");
    let request = {};
    let response;
    let dataBeforeUpdated;

    try {
        request.campaign_point_id = req.body.campaign_point_id;
        request.campaign_id = req.body.campaign_id;
        request.campaign_sub_id = req.body.campaign_sub_id;
        request.point = req.body.point;
        request.point_type = req.body.point_type;
        // request.is_default = req.body.is_default;
        // request.active = req.body.active;
        request.start_date = moment(req.body.start_date, 'YYYY-MM-DD').format("YYYY-MM-DD HH:mm:ss");
        request.end_date = moment(req.body.end_date, 'YYYY-MM-DD')
            .add(59, 'seconds')
            .add(59, 'minutes')
            .add(23, 'hours')
            .format("YYYY-MM-DD HH:mm:ss");
        console.log("request: ", request);

        let checkDateTimeRangeDupicate = await checkDateTimeRangeDupicateService(request.start_date, request.end_date, request.point_type, request.campaign_point_id);
        console.log("checkDateTimeRangeDupicate: ", checkDateTimeRangeDupicate);
        if (checkDateTimeRangeDupicate) {
            return res.status(400).send({ ResponseCode: 400, ResponseMsg: "date range dupicated", data: null })
        }

        dataBeforeUpdated = await campaign_point.findOne({
            where: {
                campaign_point_id: request.campaign_point_id
            }
        });

        dataBeforeUpdated.campaign_id = request.campaign_id;
        dataBeforeUpdated.campaign_sub_id = request.campaign_sub_id;
        dataBeforeUpdated.point = request.point;
        dataBeforeUpdated.point_type = request.point_type;
        // dataBeforeUpdated.is_default = request.is_default;
        // dataBeforeUpdated.active = request.active;
        dataBeforeUpdated.start_date = request.start_date
        dataBeforeUpdated.end_date = request.end_date;
        console.log("request: ", request);


        response = await dataBeforeUpdated.save();
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function deleteCampaignPointByCamapaignPointId(req, res) {
    console.log("deleteCampaignPointByCamapaignPointId start");
    let campaignPointId;
    let response;
    try {
        campaignPointId = req.params.id;

        let beforeDeleteResponse = await campaign_point.findOne({
            where: {
                campaign_point_id: campaignPointId
            }
        });

        if (!beforeDeleteResponse) {
            return res.status(400).send({ ResponseCode: 400, ResponseMsg: "date do not exsit", data: null })
        }

        if (beforeDeleteResponse.is_default == true) {
            return res.status(400).send({ ResponseCode: 400, ResponseMsg: "cannot delete this record because is_default == true", data: null })
        }

        response = await campaign_point.destroy({
            where: {
                campaign_point_id: campaignPointId,
                is_default: false
            }
        });

        console.log("response: ", response);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function getCurrentPoint(req, res) {
    let request = {};
    let response;
    let currentDate;
    let is_default = 0;
    let sql_query = "";
    try {
        currentDate = moment().utc().format('MM-DD-YYYY HH:mm:ss');
        // currentDate = moment(req.body.test, 'YYYY-MM-DD HH:mm:ss').utc().format('MM-DD-YYYY HH:mm:ss');
        console.log("currentDate: ", currentDate);

        request.point_type = req.body.point_type;
        request.user_id = req.body.user_id;
        request.shop_id = req.body.shop_id;
        request.review_id = req.body.review_id;

        if (request.point_type === 'create_shop') {
            let shopResponse = await getShopByShopIdService(request.shop_id);

            if (!shopResponse) {
                return res.status(400).send({ ResponseCode: 400, ResponseMsg: "shop do not exist", data: null })
            }
            currentDate = moment(shopResponse.createdAt).utc().format('YYYY-MM-DD HH:mm:ss');
            // currentDate = moment(shopResponse.createdAt).format('MM-DD-YYYY');
            console.log("shop currentDate: ", currentDate, "real time", moment(shopResponse.createdAt).format('YYYY-MM-DD HH:mm:ss'));
        }

        sql_query = `SELECT 
        campaign_point_id, campaign_id, campaign_sub_id, point, point_type, is_default, active, start_date, end_date 
        FROM patois_campaign_point pcp 
        WHERE start_date <= :currentDate
        AND end_date >= :currentDate
        AND is_default = :isDefault
        AND point_type = :pointType
        AND active = '1'`;
    
    let [results, metadata] = await db.sequelize.query(sql_query, {
        replacements: {
            currentDate: currentDate,
            isDefault: is_default,
            pointType: request.point_type
        },
        type: db.sequelize.QueryTypes.SELECT
    });
    

        console.log("results1: ", JSON.stringify(results));
        if (results.length == 0) {
            is_default = 1;
            sql_query = `SELECT 
                campaign_point_id, campaign_id, campaign_sub_id, point, point_type, is_default, active, start_date, end_date 
                FROM patois_campaign_point pcp 
                WHERE start_date <= :currentDate
                AND end_date >= :currentDate
                AND is_default = :isDefault
                AND point_type = :pointType
                AND active = '1'`;
        
            [results, metadata] = await db.sequelize.query(sql_query, {
                replacements: {
                    currentDate: currentDate,
                    isDefault: is_default,
                    pointType: request.point_type
                },
                type: db.sequelize.QueryTypes.SELECT
            });
        
            console.log("results2: ", JSON.stringify(results));
        }

        response = results;

        console.log("response: ", JSON.stringify(response));
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });

    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function checkDateTimeRangeDupicateService(startDate, endDate, point_type, campaignPointId) {
    let response = false;
    let campaignPointResponse = [];
    try {
        console.log("startDate = ", startDate, "endDate = ", endDate, "point_type = ", point_type, "campaignPointId = ", campaignPointId);
        if (campaignPointId) {
            campaignPointResponse = await campaign_point.findAll({
                where: {
                    campaign_point_id: { [Op.ne]: campaignPointId }
                }
            });
            console.log("campaignPointId campaignPointResponse: ", JSON.stringify(campaignPointResponse));
        } else if (!campaignPointId) {
            campaignPointResponse = await campaign_point.findAll();
            console.log("!campaignPointId campaignPointResponse: ", JSON.stringify(campaignPointResponse));
        }

        if (campaignPointResponse.length == 0 || !campaignPointResponse) {
            return response;
        }

        for (const campaignPointElement of campaignPointResponse) {
            if (campaignPointElement.is_default !== true && campaignPointElement.point_type === point_type) {
                // console.log("campaignPointElement1: ", campaignPointElement.start_date, campaignPointElement.end_date);
                // console.log("campaignPointElement2: ", moment(campaignPointElement.start_date).format('YYYY-MM-DD'), moment(campaignPointElement.end_date).format('YYYY-MM-DD'));
                // console.log("campaignPointElement3: ", moment(startDate), moment(endDate));

                response = moment(startDate).isBetween(moment(campaignPointElement.start_date).format('YYYY-MM-DD'), moment(campaignPointElement.end_date).format('YYYY-MM-DD'), null, '[]') || moment(endDate).isBetween(moment(campaignPointElement.start_date).format('YYYY-MM-DD'), moment(campaignPointElement.end_date).format('YYYY-MM-DD'), null, '[]')
            }
            if (response === true) {
                break;
            }
        }

        return response;
    } catch (error) {
        throw (error)
    }
}

module.exports = {
    getAllCampaignPoint,
    addCampaignPoint,
    editCamapginPoint,
    deleteCampaignPointByCamapaignPointId,
    getCurrentPoint
}