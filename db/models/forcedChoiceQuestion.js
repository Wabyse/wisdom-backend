module.exports = (sequelize, DataTypes) => {
    const ForcedChoiceQuestion = sequelize.define('ForcedChoiceQuestion', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        exam_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'exams',
                key: 'id'
            }
        },
        createdAt: {
            allowNull: false,
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'forced_choice_questions',
        timestamps: false
    });

    ForcedChoiceQuestion.associate = (models) => {
        ForcedChoiceQuestion.belongsTo(models.Exam, {
            foreignKey: 'exam_id',
            as: 'exam'
        });
        ForcedChoiceQuestion.hasMany(models.ForcedChoiceChoice, {
            foreignKey: 'question_id',
            as: 'choices'
        });
        ForcedChoiceQuestion.hasMany(models.CandidatesForcedChoiceAnswer, {
            foreignKey: 'question_id',
            as: 'answers'
        });
    };

    return ForcedChoiceQuestion;
};