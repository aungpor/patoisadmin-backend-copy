"use strict";
const axios = require('axios');
const db = require('../db.config');
const point_master = db.point_master;

async function getAllPointMaster(req, res) {
    let response = [];
    try {
        response = await point_master.findAll();

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });

    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function addPointMaster(req, res) {
    let request = {};
    let response;
    try {
        request.point_name = req.body.point_name;
        request.point_type = req.body.point_type;
        console.log("request: ", JSON.stringify(request));

        let checkPointNameOrPointTypeExist = await checkPointNameOrPointTypeExistService(request);
        console.log("checkPointNameOrPointTypeExist: ", checkPointNameOrPointTypeExist);
        if (checkPointNameOrPointTypeExist) return res.status(400).send({ ResponseCode: 400, ResponseMsg: "data exist", data: null })

        response = await point_master.create(request);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function editPointMaster(req, res) {
    let request = {};
    let response;
    let dataBeforeUpdated;
    try {
        request.point_master_id = req.body.point_master_id;
        request.point_name = req.body.point_name;
        request.point_type = req.body.point_type;
        console.log("request: ", request);

        dataBeforeUpdated = await point_master.findOne({
            where: {
                point_master_id: request.point_master_id
            }
        });
        console.log("dataBeforeUpdated: ", JSON.stringify(dataBeforeUpdated));

        if (!dataBeforeUpdated) return res.status(400).send({ ResponseCode: 400, ResponseMsg: "data do not exist", data: null })

        dataBeforeUpdated.point_name = request.point_name;
        dataBeforeUpdated.point_type = request.point_type;

        response = await dataBeforeUpdated.save();

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function deletePointMasterByPointMasterId(req, res) {
    let pointMasterId;
    let response;
    try {
        pointMasterId = req.params.id;

        response = await point_master.destroy({
            where: {
                point_master_id: pointMasterId
            }
        });

        console.log("response: ", response);
        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response });
    } catch (error) {
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null });
    }
}

async function checkPointNameOrPointTypeExistService(request) {
    let response = false;
    try {
        let pointNameResponse = await point_master.findOne({
            where: {
                point_name: request.point_name
            }
        });

        let pointTypeResponse = await point_master.findOne({
            where: {
                point_type: request.point_type
            }
        });

        if (pointNameResponse || pointTypeResponse) {
            response = true;
        }

        return response;
    } catch (error) {
        throw (error)
    }
}

module.exports = {
    getAllPointMaster,
    addPointMaster,
    editPointMaster,
    deletePointMasterByPointMasterId
}