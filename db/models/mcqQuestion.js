module.exports = (sequelize, DataTypes) => {
  const McqQuestion = sequelize.define('McqQuestion', {
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
    tableName: 'mcq_questions',
    timestamps: false
  });

  McqQuestion.associate = (models) => {
    McqQuestion.belongsTo(models.Exam, {
      foreignKey: 'exam_id',
      as: 'exam'
    });
    McqQuestion.hasMany(models.McqChoice, {
      foreignKey: 'question_id',
      as: 'choices'
    });
    McqQuestion.hasMany(models.CandidatesMcqAnswer, {
      foreignKey: 'question_id',
      as: 'answers'
    });
  };

  return McqQuestion;
};