module.exports = (sequelize, DataTypes) => {
  const EvaluationQuestion = sequelize.define(
    "EvaluationQuestion",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: DataTypes.STRING, allowNull: false },
      percentage: { type: DataTypes.INTEGER, allowNull: false },
      exam_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "exams", key: "id" },
      },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    },
    {
      tableName: "evaluation_questions",
      updatedAt: false, // only createdAt exists
    }
  );

  EvaluationQuestion.associate = (models) => {
    EvaluationQuestion.belongsTo(models.Exam, {
      foreignKey: "exam_id",
      as: "exam",
    });
    EvaluationQuestion.hasMany(models.CandidatesEvaluationAnswer, {
      foreignKey: "question_id",
      as: "answers",
    });
  };

  return EvaluationQuestion;
};