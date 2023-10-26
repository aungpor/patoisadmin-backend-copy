const moment = require('moment');
module.exports = (sequelize, Sequelize) => {
    var DataTypes = require('sequelize');
    // DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    //     return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
    // };
    // DataTypes.DATEONLY.prototype._stringify = function _stringify(date, options) {
    //     return this._applyTimezone(date, options).format('YYYY-MM-DD');
    // };

    const campaign = sequelize.define('patois_campaign',
        {
            campaign_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "campaign_id",
            },
            campaign_code: {
                type: Sequelize.STRING,
                notEmpty: true
            },
            campaign_name: {
                type: Sequelize.STRING,
                notEmpty: true
            },
            campaign_desc: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            limit_promo_per_giver: {
                type: Sequelize.INTEGER,
                notEmpty: false
            },
            limit_promo_per_receiver: {
                type: Sequelize.INTEGER,
                notEmpty: false
            },
            limit_promo_per_campaign: {
                type: Sequelize.INTEGER,
                notEmpty: false
            },
            campaign_start_date: {
                type: Sequelize.DATEONLY,
                get: function () {
                    // console.log(
                    //     "test: ",
                    //     moment.utc(this.getDataValue('campaign_start_date')).format('YYYY-MM-DD'),
                    //     typeof (moment.utc(this.getDataValue('campaign_start_date')).format('YYYY-MM-DD')));
                    return moment.utc(this.getDataValue('campaign_start_date')).format('YYYY-MM-DD');
                }
            },
            campaign_end_date: {
                type: Sequelize.DATEONLY,
                get: function () {
                    return moment.utc(this.getDataValue('campaign_end_date')).format('YYYY-MM-DD');
                }
            },
            active: {
                type: Sequelize.BOOLEAN,
                notEmpty: true
            },
            promo_point_code: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            promo_coupon_type: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            for_new_user_only: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            campaign_noti_title: {
                type: Sequelize.STRING,
                notEmpty: false
            },
        },
        {
            timestamps: false,
            tableName: 'patois_campaign',
            freezeTableName: true
        },
    )
    return campaign;
}