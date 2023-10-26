module.exports = (sequelize, Sequelize) => {
    var DataTypes = require('sequelize');
    DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
        return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
    };

    const campaign_point = sequelize.define('patois_campaign_point',
        {
            campaign_point_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "campaign_point_id"
            },
            campaign_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            campaign_sub_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
            },
            point: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            point_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            is_default: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            active: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
            },
            start_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            end_date: {
                type: DataTypes.DATE,
                allowNull: false,
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
            tableName: 'patois_campaign_point',
            freezeTableName: true,
        }
    )

    return campaign_point;
}