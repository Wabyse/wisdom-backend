module.exports = (sequelize, DataTypes) => {
    const EnvironmentResults = sequelize.define('EnvironmentResults', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'questions',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        report_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'environment_reports',
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
        tableName: 'environment_results',
        timestamps: true,
        updatedAt: false,
    });

    EnvironmentResults.associate = (models) => {
        EnvironmentResults.belongsTo(models.Question, { foreignKey: 'question_id', as: 'questionResult' });
        EnvironmentResults.belongsTo(models.EnvironmentReports, { foreignKey: 'report_id', as: 'report' });
    };

    return EnvironmentResults;
}