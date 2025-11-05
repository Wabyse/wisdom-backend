module.exports = (sequelize, DataTypes) => {
    const Exam = sequelize.define('Exam', {
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
        code: {
            type: DataTypes.STRING,
            allowNull: true
        },
        type: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        tableName: 'exams',
        timestamps: false,
    });

    Exam.associate = (models) => {
        Exam.hasMany(models.RatingScaleQuestion, {
            foreignKey: 'exam_id',
            as: 'questions'
        });
        Exam.hasMany(models.CandidatesRateScaleExam, {
            foreignKey: 'exam_id',
            as: 'exams'
        });
        Exam.hasMany(models.McqQuestion, {
            foreignKey: 'exam_id',
            as: 'mcq_questions'
        });
        Exam.hasMany(models.CandidatesMcqExam, {
            foreignKey: 'exam_id',
            as: 'mcqExams'
        });
        Exam.hasMany(models.ForcedChoiceQuestion, {
            foreignKey: 'exam_id',
            as: 'forcedChoiceQuestions'
        });
        Exam.hasMany(models.CandidatesForcedChoiceExam, {
            foreignKey: 'exam_id',
            as: 'forcedChoiceExams'
        });
    };

    return Exam;
};