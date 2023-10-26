module.exports = (sequelize, Sequelize) => {
    var DataTypes = require('sequelize');
    DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
        return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
    };

    const user = sequelize.define('patois_campaign_user',
        {
            campaign_user_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "campaign_user_id"
            },
            campaign_id: {
                type: Sequelize.INTEGER,
                notEmpty: true
            },
            giver_id: {
                type: Sequelize.INTEGER,
                notEmpty: true
            },
            campaign_url: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            ref_code: {
                type: Sequelize.STRING,
                notEmpty: true
            },
            campaign_code: {
                type: Sequelize.STRING,
                notEmpty: true
            },
            encrypted_ref_code: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            encrypted_campaign_code: {
                type: Sequelize.STRING,
                notEmpty: false
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
            tableName: 'patois_campaign_user',
            freezeTableName: true,
        }
    )

    return user;
}