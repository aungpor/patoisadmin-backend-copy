"use strict";
const axios = require('axios');
const PATOIS_MICROSERVICE_API_URL = process.env.APP_ENVIRONMENT == 'Production' ? 'https://api.patois.com' : 'https://uatapi-patois.pt.co.th'
const JWT_PATOIS_API = process.env.JWT_PATOIS_API

async function missoinByMissionCodeService(mission_code, mission_step_code = null, userId) {
    let token = JWT_PATOIS_API
    console.log("mission_code: ", mission_code);
    console.log("mission_step_code: ", mission_step_code);
    console.log("userId: ", userId);
    try {
        let handleMissoinResult = await axios({
            url: `${PATOIS_MICROSERVICE_API_URL}/api/campaign/mission/admin/handleMissoinByMissionCode`,
            method: 'POST',
            headers: {
                'token': "Bearer " + token,
                'Content-Type': 'application/json'
            },
            data: {
                "mission_code": mission_code,
                "mission_step_code": mission_step_code,
                "userId": userId
            }
        })
            .then(data => {
                return data.data.data
            })
            .catch(err => {
                throw err
            })

        return handleMissoinResult;

    } catch (error) {

        // return error.message;
        throw error;
    }


}

module.exports = {
    missoinByMissionCodeService
}