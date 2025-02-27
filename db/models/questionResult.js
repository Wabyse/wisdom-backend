module.exports = (sequelize, DataTypes) => {
    const QuestionResult = sequelize.define('QuestionResult', {
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
                model: 'individual_reports',
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
        tableName: 'questions_results',
        timestamps: true,
        updatedAt: false,
    });

    QuestionResult.associate = (models) => {
        QuestionResult.belongsTo(models.Question, { foreignKey: 'question_id', as: 'question' });
        QuestionResult.belongsTo(models.IndividualReport, { foreignKey: 'report_id', as: 'report' });
    };

    return QuestionResult;
}