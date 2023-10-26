module.exports = (sequelize, Sequelize) => {
    var DataTypes = require('sequelize');
    DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
        return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
    };

    const patois_notifications = sequelize.define('patois_notifications',
        {
            notifications_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "notifications_id"
            },
            user_id: {
                type: Sequelize.INTEGER,
                notEmpty: false
            },
            title: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            description: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            types: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            withs: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            status: {
                type: Sequelize.INTEGER,
                notEmpty: false
            },
            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: 'updated_at'
            },
        },
        {
            tableName: 'patois_notifications',
            freezeTableName: true,
        }
    )
    return patois_notifications;
}