module.exports = (sequelize, DataTypes) => {
  const CandidatesRateScaleAnswer = sequelize.define('CandidatesRateScaleAnswer', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    exam_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'candidates_rate_scale_answers',
    timestamps: false // ✅ only createdAt
  });

  CandidatesRateScaleAnswer.associate = (models) => {
    CandidatesRateScaleAnswer.belongsTo(models.CandidatesRateScaleExam, {
      foreignKey: 'exam_id',
      as: 'examInstance'
    });
  };

  return CandidatesRateScaleAnswer;
};