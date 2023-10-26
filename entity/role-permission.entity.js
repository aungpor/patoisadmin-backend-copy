module.exports = (sequelize, Sequelize) => {
    var DataTypes = require('sequelize');
    DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
        return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
    };

    const role_permission = sequelize.define('admin_role_permission',
        {
            role_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: "role_id"
            },
            permission_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: "permission_id"
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
            tableName: 'admin_role_permission',
            freezeTableName: true,
        }
    )

    return role_permission
}