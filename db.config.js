const { Sequelize } = require('sequelize');

const sql = {
    server: process.env.SQL_SERVER,
    database: process.env.SQL_DATABASE,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
}

const sequelize = new Sequelize(sql.database, sql.user, sql.password,
    {
        host: sql.server,
        port: 1433,
        dialect: "mssql",
        dialectOptions: {
            encrypt: true
        }
    });

const db = {};
db.shop = require('./entity/shop.entity')(sequelize, Sequelize);
db.user = require('./entity/user.entity')(sequelize, Sequelize);
db.campaign = require('./entity/campaign.entity')(sequelize, Sequelize);
db.campaign_user = require('./entity/campaign-user.entity')(sequelize, Sequelize);
db.maxcard = require('./entity/maxcard.entity')(sequelize, Sequelize);
db.patois_notification = require('./entity/notification.entity')(sequelize, Sequelize);
db.point_master = require('./entity/point-master.entity')(sequelize, Sequelize);
db.campaign_point = require('./entity/campaign-point.entity')(sequelize, Sequelize);
db.admin_user = require('./entity/admin-user.entity')(sequelize, Sequelize);
db.admin_role = require('./entity/admin-role.entity')(sequelize, Sequelize);
db.assign_role = require('./entity/assign-role.entity')(sequelize, Sequelize);
db.admin_permission = require('./entity/admin-permission.entity')(sequelize, Sequelize);
db.role_permission = require('./entity/role-permission.entity')(sequelize, Sequelize);
db.admin_permission_group = require('./entity/permission-group.entity')(sequelize, Sequelize);


db.Sequelize = Sequelize;
db.sequelize = sequelize;



module.exports = db;
