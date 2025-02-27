module.exports = (sequelize, DataTypes) => {
    const IndividualReport = sequelize.define('IndividualReport', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        Assessor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        Assessee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
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
        tableName: 'individual_reports',
        timestamps: true,
        updatedAt: false,
    });
    
    IndividualReport.associate = (models) => {
        IndividualReport.belongsTo(models.User, { foreignKey: 'Assessor_id', as: 'assessor' });
        IndividualReport.belongsTo(models.User, { foreignKey: 'Assessee_id', as: 'assessee' });
        IndividualReport.hasMany(models.QuestionResult, { foreignKey: 'report_id', as: 'results' });
    };
    
    return IndividualReport;
}