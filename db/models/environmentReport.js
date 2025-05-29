module.exports = (sequelize, DataTypes) => {
    const EnvironmentReports = sequelize.define('EnvironmentReports', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'environment_reports',
        timestamps: true,
        updatedAt: false,
    });

    EnvironmentReports.associate = (models) => {
        EnvironmentReports.belongsTo(models.User, { foreignKey: 'user_id', as: 'employee' });
        EnvironmentReports.hasMany(models.EnvironmentResults, { foreignKey: 'report_id', as: 'results' });
        EnvironmentReports.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' });
    };

    return EnvironmentReports;
}