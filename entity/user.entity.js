module.exports = (sequelize, Sequelize) => {
  var DataTypes = require("sequelize");
  DataTypes.DATE.prototype._stringify = function _stringify(date, options) {
    return this._applyTimezone(date, options).format("YYYY-MM-DD HH:mm:ss.SSS");
  };

  const user = sequelize.define(
    "users",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        field: "id",
      },

      name: {
        type: Sequelize.STRING,
        notEmpty: true,
      },
      email: {
        type: Sequelize.STRING,
        notEmpty: false,
      },
      email_verified_at: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      password: {
        type: Sequelize.STRING,
        notEmpty: false,
      },
      remember_token: {
        type: Sequelize.STRING,
        notEmpty: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
      },
      teamName: {
        type: Sequelize.INTEGER,
        notEmpty: false,
      },
      emp_id: {
        type: Sequelize.STRING,
        notEmpty: false,
      },
      line_id: {
        type: Sequelize.INTEGER,
        notEmpty: false,
      },
      profile_pic_line: {
        type: Sequelize.STRING,
        notEmpty: false,
      },
      active: {
        type: Sequelize.BOOLEAN,
        notEmpty: false,
      },
      tel: {
        type: Sequelize.STRING,
        notEmpty: false,
      },
      groups_id: {
        type: Sequelize.INTEGER,
        notEmpty: false,
      },
      profile_pic_patois: {
        type: Sequelize.STRING,
        notEmpty: false,
      },
      patois_maxcard_id: {
        type: Sequelize.INTEGER,
        notEmpty: false,
      },
      provider: {
        type: Sequelize.STRING,
        notEmpty: false,
      },
      pdpa_id: {
        type: Sequelize.INTEGER,
        notEmpty: false,
      },
      pdpa_version: {
        type: Sequelize.STRING,
        notEmpty: false,
      },
      pdpa_isagree: {
        type: Sequelize.BOOLEAN,
        notEmpty: false,
      },
      pdpa_acceptance_date: {
        type: DataTypes.DATE,
        field: "updated_at",
        defaultValue: Sequelize.NOW,
      },
      user_code: {
        type: Sequelize.STRING,
        notEmpty: false,
      },
    },
    {
      tableName: "users",
      freezeTableName: true,
    }
  );

  return user;
};
