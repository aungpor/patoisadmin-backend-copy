module.exports = (sequelize, Sequelize) => {
    var DataTypes = require('sequelize');
    DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
        return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
    };

    const shop = sequelize.define('wongnok_shop',
        {
            shop_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "shop_id"
            },
            location_id: {
                type: Sequelize.INTEGER,
                notEmpty: true
            },
            shopName: {
                type: Sequelize.STRING,
                notEmpty: true
            },
            shopType_id: {
                type: Sequelize.INTEGER,
                notEmpty: false
            },

            foodType_id: {
                type: Sequelize.INTEGER,
                notEmpty: false
            },
            opening_time: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            recommend: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            images_id: {
                type: Sequelize.INTEGER,
                notEmpty: false
            },
            remark: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            owner_id: {
                type: Sequelize.INTEGER,
                notEmpty: false
            },
            user_id: {
                type: Sequelize.INTEGER,
                notEmpty: false,
            },
            parkinglot_id: {
                type: Sequelize.INTEGER,
                notEmpty: false,
            },
            shopsize_id: {
                type: Sequelize.INTEGER,
                notEmpty: false,
            },
            shopweekday_id: {
                type: Sequelize.STRING,
                notEmpty: false,
            },
            closing_time: {
                type: Sequelize.STRING,
                notEmpty: false,
            },
            view_count: {
                type: Sequelize.INTEGER,
                notEmpty: false,
            },
            price_range: {
                type: Sequelize.INTEGER,
                notEmpty: false,
            },
            tel: {
                type: Sequelize.STRING,
                notEmpty: false,
            },
            opendatetime_id: {
                type: Sequelize.INTEGER,
                notEmpty: false,
            },
            foodType_other: {
                type: Sequelize.STRING,
                notEmpty: false,
            },
            interface_from: {
                type: Sequelize.STRING,
                notEmpty: false,
            },
            user_id_edit: {
                type: Sequelize.INTEGER,
                notEmpty: false,
            },
            history_id: {
                type: Sequelize.INTEGER,
                notEmpty: false,
            },
            active: {
                type: Sequelize.BOOLEAN,
                notEmpty: false,
            },
            shop_status_code: {
                type: Sequelize.STRING,
                notEmpty: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                // allowNull: false,
                field: 'created_at'
            },
            updatedAt: {
                type: DataTypes.DATE,
                // allowNull: false,
                field: 'updated_at'
            }
        },
        {
            tableName: 'wongnok_shop',
            freezeTableName: true,
        }
    )

    return shop
}