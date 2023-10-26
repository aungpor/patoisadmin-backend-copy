"use strict";
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const axios = require('axios');
const db = require('../db.config');
const util = require('../routes/util');
const shop = db.shop;
const patois_url = process.env.PATOIS_URL;
const moment = require('moment');
const missionService = require('./mission.service')
const ExcelJS = require('exceljs');

var config_in = {
    userName: process.env.SQL_USER, // update me
    password: process.env.SQL_PASSWORD, // update me
    server: process.env.SQL_SERVER, // update me
    options: {
        database: process.env.SQL_DATABASE, //update me
        encrypt: true,
    },
};

async function getShopByShopStatus(req, res) {
    try {
        let shops;
        let status = req.params.status;
        console.log("status: ", status);
        let response = [];
        if (status == "1") {
            shops = await shop.findAll({
                where: {
                    // active: 0
                    shop_status_code: status
                }
            });
        } else {
            shops = await shop.findAll({
                where: {
                    shop_status_code: status
                },
                order: [['shop_id', 'DESC']],
                limit: 100
            });
        }

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: shops })
    } catch (error) {
        console.log("error: ", error);
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }

}

async function getShopDetail(shopId) {

    return await axios({
        url: `${patois_url}/api/shop/allaction/${shopId}`,
        method: 'GET',
        // data: {
        //     ClientID: config.MaxCard_ClientID,
        //     ClientSecret: config.MaxCard_ClientSecret,
        //     Input: dataEncrypt
        // }
    })
        .then(response => {
            // console.log("response: ", response.data);
            return response.data.data[0];
        })
        .catch(async err => {
            console.log("error : " + err);
            // res.status(400).send({ ResponseCode: 400, ResponseMsg: err.message, data: null });
            return err
        });

}


async function updateShopByShopStatus(req, res) {
    try {
        console.log("req: ", req.body);
        let request = req.body;
        let response;
        if (request && request.shop_status_code && request.shop_id) {
            response = await shop.findOne({
                where: {
                    shop_id: parseInt(request.shop_id),
                },
            });
            response.shop_status_code = request.shop_status_code;
            if (request.shop_status_code == "3" || request.shop_status_code == "4") {
                response.active = 0;
            } else if (request.shop_status_code == "2") {
                response.active = 1;
                let missionRes = await missionService.missoinByMissionCodeService('M0000014', 'S003', response.user_id)
                console.log("missionRes: ", missionRes);
            }
            response = await response.save();

            res.send({ ResponseCode: 200, ResponseMsg: "success", data: response })

        } else {
            res.send({ ResponseCode: 400, ResponseMsg: "data do not exist", data: null })
        }

    } catch (error) {
        console.log("error: ", error);
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }

}

async function mergeShop(req, res) {
    try {
        console.log("req: ", req.body);
        let request = req.body;
        let to_shop = request.to_shop;
        let from_shop = request.from_shop;
        let response;

        var input_param = [];
        input_param.push({ name: "to_shop", type: "C", value: to_shop });
        input_param.push({ name: "from_shop", type: "C", value: from_shop });

        var sql = "exec merge_shop_data  @to_shop ,  @from_shop  ";

        let data = await util.querynewDB2(config_in, sql, input_param);
        console.log("data: ", data);
        let sql_result = JSON.parse(data);

        sql_result = sql_result["results"];
        let html = "";
        html = html + "<table border=1><tr><td>" + data;

        html = html + "</tr></td></table>";

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: html })


    } catch (error) {
        console.log("error: ", error);
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: null })
    }

}

async function getShopReport(req, res) {
    try {
        let response = [];

        let startDate = req.body.start_date;
        let endDate = req.body.end_date;

        startDate = moment(startDate, 'YYYY-MM-DD').format('MM-DD-YYYY');
        endDate = moment(endDate, 'YYYY-MM-DD').format('MM-DD-YYYY');

        const [results, metadata] = await db.sequelize.query(`
        select 
        cast(created_at as date) as date,
        count(shop_status_code) as all_shop,
        sum(IIF (shop_status_code = '2', 1, 0)) as approved_shop,
        sum(IIF (shop_status_code = '1', 1, 0)) as non_approved_shop,
        sum(IIF (shop_status_code = '3' and interface_from != 'duplicate', 1, 0)) as rejected_shop,
        sum(IIF (shop_status_code = '3' and interface_from = 'duplicate', 1, 0)) as merged_shop,
        IIF(COUNT(*)  = (
        sum(IIF (shop_status_code = '2', 1, 0)) +
        sum(IIF (shop_status_code = '3' and interface_from != 'duplicate', 1, 0)) +
        sum(IIF (shop_status_code = '3' and interface_from = 'duplicate', 1, 0))), 'Done', 'Pending')as status
        from wongnok_shop ws 
        WHERE cast( created_at as date) BETWEEN '${startDate}' and '${endDate}'
        GROUP  by cast(created_at as date) 
        `);

        response = results;

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response })
    } catch (error) {
        console.log("error: ", error);
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: [] })
    }
}

async function getShopByShopIdService(shopId) {
    console.log("getShopByShopIdService: ", shopId);
    let response = {};
    try {
        response = await shop.findOne({
            where: {
                shop_id: shopId
            }
        });
        console.log("getShopByShopIdService response: ", JSON.stringify(response));
        return response;
    } catch (error) {
        throw (error)
    }
}

async function getShopWithLocationByStatus(req, res) {
    try {
        let status = req.params.status;
        let response = [];

        const [results, metadata] = await db.sequelize.query(`
        SELECT shop.shop_id, shop.location_id, shop.shopName, shop.created_at, shop.updated_at, shop.shop_status_code, location.latitude
      ,location.longitude
FROM dbo.wongnok_shop shop
LEFT JOIN dbo.wongnok_location location ON shop.location_id = location.location_id
WHERE shop.shop_status_code = '${status}'
        `);

        response = results;

        res.send({ ResponseCode: 200, ResponseMsg: "success", data: response })
    } catch (error) {
        console.log("error: ", error);
        res.status(400).send({ ResponseCode: 400, ResponseMsg: error.message, data: [] })
    }
}

async function shopExportExcel(req, res) {
    try {
        let status = req.params.status;

        const [results, metadata] = await db.sequelize.query(`
        SELECT shop.shop_id, shop.location_id, shop.shopName, shop.created_at, shop.updated_at, shop.shop_status_code, location.latitude
      ,location.longitude
FROM dbo.wongnok_shop shop
LEFT JOIN dbo.wongnok_location location ON shop.location_id = location.location_id
WHERE shop.shop_status_code = '${status}'
        `);

        const shopArray = [];
        for (const shopObj of results) {
                  const shopObject = {
                    shop_id: shopObj.shop_id,
                    shopName: shopObj.shopName,
                    create_date: moment(shopObj.created_at).format("YYYY-MM-DD hh:mm:ss a"),
                    update_date: moment(shopObj.updated_at).format("YYYY-MM-DD hh:mm:ss a"),
                    latitude: shopObj.latitude,
                    longitude: shopObj.longitude,
                    latitude_longitude: shopObj.latitude + ", " + shopObj.longitude
                  }
                  shopArray.push(shopObject);
                }

        // สร้างไฟล์ .xlsx
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');
        worksheet.columns = [
          { header: 'Shop ID', key: 'shop_id', width: 30 },
          { header: 'Shop Name', key: 'shopName', width: 30 },
          { header: 'Created Date', key: 'create_date', width: 30 },
          { header: 'Update Date', key: 'update_date', width: 30 },
          { header: 'Latitude & Longitude', key: 'latitude_longitude', width: 30 },
        ];

        shopArray.map((shopData) => {
            worksheet.addRow({ shop_id: shopData.shop_id, shopName: shopData.shopName, create_date: shopData.create_date, update_date: shopData.update_date, latitude_longitude: shopData.latitude_longitude });
        })
    
        const buffer = await workbook.xlsx.writeBuffer();
    
        // ส่งไฟล์ .xlsx กลับไปยังผู้ใช้
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        const currentDate = moment(new Date()).format("YYYY-MM-DD hh:mm:ss a")
        if(status == "1"){
            res.setHeader('Content-Disposition', `attachment; filename=NewShop_ShopApproval_${currentDate}.xlsx`);
        }
        if(status == "2"){
            res.setHeader('Content-Disposition', `attachment; filename=Approved_ShopApproval_${currentDate}.xlsx`);
        }
        if(status == "3"){
            res.setHeader('Content-Disposition', `attachment; filename=Rejected_ShopApproval_${currentDate}.xlsx`);
        }
        
        res.send(buffer);
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้างไฟล์ Excel: ', error);
        res.status(500).send('เกิดข้อผิดพลาดในการสร้างไฟล์ Excel');
      }
}

module.exports = {
    getShopByShopStatus,
    updateShopByShopStatus,
    mergeShop,
    getShopReport,
    getShopByShopIdService,
    getShopWithLocationByStatus,
    shopExportExcel
}