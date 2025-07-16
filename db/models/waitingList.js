module.exports = (sequelize, DataTypes) => {
    const WaitingList = sequelize.define('WaitingList', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        }
    }, {
        paranoid: false,
        tableName: 'waiting_list',
        timestamps: true,
        updatedAt: false,
    });

    return WaitingList;
};