module.exports = (sequelize, Sequelize) => {
    var DataTypes = require('sequelize');
    DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
        return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
    };

    const patois_maxcard = sequelize.define('patois_maxcard',
        {
            patois_maxcard_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "patois_maxcard_id"
            },
            patois_user_id: {
                type: Sequelize.INTEGER,
                notEmpty: true
            },
            patois_tel: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            patois_maxcard_no: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            patois_status: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            patois_active: {
                type: Sequelize.BOOLEAN,
                notEmpty: false
            },
            createdAt: {
                type: DataTypes.DATE,
                field: 'patois_created_at'
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: 'patois_updated_at'
            },
            patois_create_by: {
                type: Sequelize.INTEGER,
                notEmpty: false
            },
            patois_update_by: {
                type: Sequelize.INTEGER,
                notEmpty: false
            },
            maxcard_activate_date: {
                type: DataTypes.DATE,
                field: 'maxcard_activate_date'
            },
            isemployee: {
                type: Sequelize.BOOLEAN,
                // notEmpty: true,
                defaultValue: 0
            },
        },
        {
            tableName: 'patois_maxcard',
            freezeTableName: true,
        }
    )
    return patois_maxcard;
}