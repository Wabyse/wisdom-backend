module.exports = (sequelize, DataTypes) => {
  const CandidatesRateScaleExam = sequelize.define('CandidatesRateScaleExam', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    candidate_id: {
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
    tableName: 'candidates_rate_scale_exams',
    timestamps: false
  });

  CandidatesRateScaleExam.associate = (models) => {
    CandidatesRateScaleExam.belongsTo(models.PeCandidate, {
      foreignKey: 'candidate_id',
      as: 'candidate'
    });

    CandidatesRateScaleExam.belongsTo(models.Exam, {
      foreignKey: 'exam_id',
      as: 'exam'
    });
    CandidatesRateScaleExam.hasMany(models.CandidatesRateScaleAnswer, {
      foreignKey: 'exam_id',
      as: 'answers'
    });
  };

  return CandidatesRateScaleExam;
};