module.exports = (sequelize, Sequelize) => {
    var DataTypes = require('sequelize');
    DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
        return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
    };

    const admin_user = sequelize.define('admin_user',
        {
            user_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "user_id"
            },
            user_name: {
                type: Sequelize.STRING,
                notEmpty: true
            },
            user_email: {
                type: Sequelize.STRING,
                notEmpty: true
            },
            active: {
                type: Sequelize.BOOLEAN,
                notEmpty: true,
            },
            create_by: {
                type: Sequelize.INTEGER,
                notEmpty: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                field: "create_date",
            },
            update_by: {
                type: Sequelize.INTEGER,
                notEmpty: false,
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: "create_date",
            },
        },
        {
            tableName: 'admin_user',
            freezeTableName: true,
        }
    )

    return admin_user
}