module.exports = (sequelize, DataTypes) => {
  const CandidatesEvaluationAnswer = sequelize.define(
    "CandidatesEvaluationAnswer",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      score: { type: DataTypes.INTEGER, allowNull: false },
      exam_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "candidates_evaluation_exams", key: "id" },
      },
      question_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "evaluation_questions", key: "id" },
      },
      comment: { type: DataTypes.TEXT },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "candidates_evaluation_answers",
      updatedAt: false, // only createdAt
    }
  );

  CandidatesEvaluationAnswer.associate = (models) => {
    CandidatesEvaluationAnswer.belongsTo(models.CandidatesEvaluationExam, {
      foreignKey: "exam_id",
      as: "evaluation_exam",
    });

    CandidatesEvaluationAnswer.belongsTo(models.EvaluationQuestion, {
      foreignKey: "question_id",
      as: "question",
    });
  };

  return CandidatesEvaluationAnswer;
};