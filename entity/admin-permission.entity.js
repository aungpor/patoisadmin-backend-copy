module.exports = (sequelize, Sequelize) => {
    var DataTypes = require('sequelize');
    DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
        return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
    };

    const admin_permission = sequelize.define('admin_permission',
        {
            permission_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: "permission_id"
            },
            permission_name: {
                type: Sequelize.STRING,
                notEmpty: true
            },
            permission_code: {
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
            permission_group_code: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: "permission_group_code"
            },
            permission_api: {
                type: Sequelize.STRING,
                notEmpty: true
            },
            sidenav_path: {
                type: Sequelize.STRING,
                notEmpty: false
            },
            sidenav_icon: {
                type: Sequelize.STRING,
                notEmpty: false
            },
        },
        {
            tableName: 'admin_permission',
            freezeTableName: true,
        }
    )

    return admin_permission
}