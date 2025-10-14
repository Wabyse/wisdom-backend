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

    Authority.associate = (models) => {
        Authority.hasMany(models.Task, { foreignKey: 'authority_id', as: 'tasks' });
        Authority.hasMany(models.Project, { foreignKey: 'authority_id', as: 'projects' });
    };

    return Authority;
};