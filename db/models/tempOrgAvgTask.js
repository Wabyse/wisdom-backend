module.exports = (sequelize, DataTypes) => {
    const TempOrgAvgTask = sequelize.define('TempOrgAvgTask', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'id'
            }
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'temp_org_avg_tasks',
        timestamps: true,
        updatedAt: false,
    });

    TempOrgAvgTask.associate = (models) => {
        TempOrgAvgTask.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' });
    };

    return TempOrgAvgTask;
}