module.exports = (sequelize, DataTypes) => {
  const CandidatesForcedChoiceAnswer = sequelize.define('CandidatesForcedChoiceAnswer', {
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
        model: 'forced_choice_choices',
        key: 'id'
      }
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'candidates_forced_choice_exams',
        key: 'id'
      }
    },
    question_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'forced_choice_questions',
        key: 'id'
      }
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'candidates_forced_choice_answers',
    timestamps: false
  });

  CandidatesForcedChoiceAnswer.associate = (models) => {
    CandidatesForcedChoiceAnswer.belongsTo(models.ForcedChoiceChoice, {
      foreignKey: 'choice_id',
      as: 'choice'
    });
    CandidatesForcedChoiceAnswer.belongsTo(models.CandidatesForcedChoiceExam, {
      foreignKey: 'exam_id',
      as: 'exam'
    });
    CandidatesForcedChoiceAnswer.belongsTo(models.ForcedChoiceQuestion, {
      foreignKey: 'question_id',
      as: 'question'
    });
  };

  return CandidatesForcedChoiceAnswer;
};