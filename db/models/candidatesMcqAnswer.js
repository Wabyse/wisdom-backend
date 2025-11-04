module.exports = (sequelize, DataTypes) => {
  const CandidatesMcqAnswer = sequelize.define('CandidatesMcqAnswer', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    choice_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'mcq_choices',
        key: 'id'
      }
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'candidates_mcq_exams',
        key: 'id'
      }
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'mcq_questions',
        key: 'id'
      }
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'candidates_mcq_answers',
    timestamps: false
  });

  CandidatesMcqAnswer.associate = (models) => {
    CandidatesMcqAnswer.belongsTo(models.McqChoice, {
      foreignKey: 'choice_id',
      as: 'choice'
    });
    CandidatesMcqAnswer.belongsTo(models.CandidatesMcqExam, {
      foreignKey: 'exam_id',
      as: 'exam'
    });
    CandidatesMcqAnswer.belongsTo(models.McqQuestion, {
      foreignKey: 'question_id',
      as: 'question'
    });
  };

  return CandidatesMcqAnswer;
};