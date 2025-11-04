module.exports = (sequelize, DataTypes) => {
    const CandidatesMcqExam = sequelize.define('CandidatesMcqExam', {
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
        tableName: 'candidates_mcq_exams',
        timestamps: false
    });

    CandidatesMcqExam.associate = (models) => {
        CandidatesMcqExam.belongsTo(models.PeCandidate, {
            foreignKey: 'candidate_id',
            as: 'candidate'
        });
        CandidatesMcqExam.belongsTo(models.Exam, {
            foreignKey: 'exam_id',
            as: 'exam'
        });
        CandidatesMcqExam.hasMany(models.CandidatesMcqAnswer, {
            foreignKey: 'exam_id',
            as: 'answers'
        });
    };

    return CandidatesMcqExam;
};