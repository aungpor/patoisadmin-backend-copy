module.exports = (sequelize, Sequelize) => {
    var DataTypes = require('sequelize');
    DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
        return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
    };

    const admin_permission_group = sequelize.define('admin_permission_group',
        {
            permission_group_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "permission_group_id"
            },
            permission_group_name: {
                type: Sequelize.STRING,
                notEmpty: true,
                field: "permission_group_name"
            },
            permission_group_code: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: "permission_group_code"
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
            tableName: 'admin_permission_group',
            freezeTableName: true,
        }
    )

    return admin_permission_group
}