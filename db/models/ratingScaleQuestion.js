module.exports = (sequelize, DataTypes) => {
  const RatingScaleQuestion = sequelize.define('RatingScaleQuestion', {
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
    rate_scale: {
      type: DataTypes.INTEGER,
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
    reverse: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    code_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'exam_result_codes',
        key: 'id'
      }
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'rating_scale_questions',
    timestamps: false,
  });

  RatingScaleQuestion.associate = (models) => {
    RatingScaleQuestion.belongsTo(models.Exam, {
      foreignKey: 'exam_id',
      as: 'exam'
    });
  };

  return RatingScaleQuestion;
};