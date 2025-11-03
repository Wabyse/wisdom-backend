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
        }
    }, {
        tableName: 'exams',
        timestamps: true,
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
    };

    return Exam;
};