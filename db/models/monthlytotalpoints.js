module.exports = (sequelize, DataTypes) => {
  const MonthlyTotalPoints = sequelize.define('MonthlyTotalPoints', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users_points',
        key: 'id'
      },
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'monthly_total_points',
    timestamps: true
  });

  MonthlyTotalPoints.associate = function (models) {
    MonthlyTotalPoints.belongsTo(models.UsersPoints, { foreignKey: 'user_id', as: 'user' });
  };

  return MonthlyTotalPoints;
};