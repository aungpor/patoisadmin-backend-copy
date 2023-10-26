module.exports = (sequelize, Sequelize) => {
    var DataTypes = require('sequelize');
    DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
        return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
    };

    const assign_role = sequelize.define('admin_assign_role',
        {
            user_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: "user_id"
            },
            role_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                field: "role_id"
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
            tableName: 'admin_assign_role',
            freezeTableName: true,
        }
    )

    return assign_role
}