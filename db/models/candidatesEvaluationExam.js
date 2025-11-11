module.exports = (sequelize, DataTypes) => {
    const CandidatesEvaluationExam = sequelize.define(
        "CandidatesEvaluationExam",
        {
            id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
            candidate_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "pe_candidates", key: "id" },
            },
            exam_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: "exams", key: "id" },
            },
            createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        },
        {
            tableName: "candidates_evaluation_exams",
            updatedAt: false,
        }
    );

    CandidatesEvaluationExam.associate = (models) => {
        CandidatesEvaluationExam.belongsTo(models.PeCandidate, {
            foreignKey: "candidate_id",
            as: "candidate",
        });
        CandidatesEvaluationExam.belongsTo(models.Exam, {
            foreignKey: "exam_id",
            as: "exam",
        });
        CandidatesEvaluationExam.belongsTo(models.CandidatesEvaluationAnswer, {
            foreignKey: "exam_id",
            as: "answers",
        });
    };

    return CandidatesEvaluationExam;
};