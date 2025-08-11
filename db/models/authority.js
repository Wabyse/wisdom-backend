module.exports = (sequelize, DataTypes) => {
    const Authority = sequelize.define('Authority', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        tableName: 'authorities',
        timestamps: true
    });

    return Authority;
};