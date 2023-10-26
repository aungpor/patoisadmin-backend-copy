module.exports = (sequelize, Sequelize) => {
    var DataTypes = require('sequelize');
    DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
        return this._applyTimezone(date, options).format('YYYY-MM-DD HH:mm:ss.SSS');
    };

    const point_master = sequelize.define('patois_point_master',
        {
            point_master_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                field: "point_master_id"
            },
            point_name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            point_type: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            createdAt: {
                type: DataTypes.DATE,
                field: 'created_at'
            },
            updatedAt: {
                type: DataTypes.DATE,
                field: 'updated_at'
            }
        },
        {
            tableName: 'patois_point_master',
            freezeTableName: true,
        }
    )

    return point_master;
}