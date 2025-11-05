module.exports = (sequelize, DataTypes) => {
    const CandidatesForcedChoiceExam = sequelize.define('CandidatesForcedChoiceExam', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        candidate_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'pe_candidates',
                key: 'id'
            }
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
        tableName: 'candidates_forced_choice_exams',
        timestamps: false
    });

    CandidatesForcedChoiceExam.associate = (models) => {
        CandidatesForcedChoiceExam.belongsTo(models.PeCandidate, {
            foreignKey: 'candidate_id',
            as: 'candidate'
        });
        CandidatesForcedChoiceExam.belongsTo(models.Exam, {
            foreignKey: 'exam_id',
            as: 'exam'
        });
        CandidatesForcedChoiceExam.hasMany(models.CandidatesForcedChoiceAnswer, {
            foreignKey: 'exam_id',
            as: 'answers'
        });
    };

    return CandidatesForcedChoiceExam;
};