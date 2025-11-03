module.exports = (sequelize, DataTypes) => {
  const ExamResultCode = sequelize.define('ExamResultCode', {
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
    code: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'exam_result_codes',
    timestamps: false
  });

  ExamResultCode.associate = (models) => {
    
  };

  return ExamResultCode;
};