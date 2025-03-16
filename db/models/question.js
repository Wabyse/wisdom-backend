module.exports = (sequelize, DataTypes) => {
    const Question = sequelize.define('Question', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        en_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ar_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        manifest_code: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'questions_manifest',
                key: 'code',
            },
            onDelete: 'RESTRICT'
        },
        weight: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        max_score: {
            type: DataTypes.INTEGER,
        },
        sub_field_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'sub_fields',
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
        tableName: 'questions',
        timestamps: true,
        updatedAt: false,
    });

    Question.associate = (models) => {
        Question.belongsTo(models.SubField, { foreignKey: 'sub_field_id', as: 'sub_field' });
        Question.hasMany(models.CurriculumResult, { foreignKey: 'question_id', as: 'currResults' });
        Question.hasMany(models.QuestionResult, { foreignKey: 'question_id', as: 'quesResults' });
        Question.hasMany(models.EnvironmentResults, { foreignKey: 'question_id', as: 'envResults' });
        Question.belongsTo(models.QuestionManifest, { foreignKey: 'manifest_code', as: 'questions' });
    };

    return Question;
}