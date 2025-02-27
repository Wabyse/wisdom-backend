module.exports = (sequelize, DataTypes) => {
    const CurriculumResult = sequelize.define('CurriculumResult', {
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
                model: 'curriculums_reports',
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
        tableName: 'curriculums_results',
        timestamps: true,
        updatedAt: false,
    });

    CurriculumResult.associate = (models) => {
        CurriculumResult.belongsTo(models.Question, { foreignKey: 'question_id', as: 'questionResult' });
        CurriculumResult.belongsTo(models.CurriculumReport, { foreignKey: 'report_id', as: 'report' });
    };

    return CurriculumResult;
}