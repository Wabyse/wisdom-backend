module.exports = (sequelize, DataTypes) => {
  const UsersPoints = sequelize.define('UsersPoints', {
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users_points',
    timestamps: true,
    paranoid: true
  });

  UsersPoints.associate = function (models) {
    UsersPoints.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    UsersPoints.hasMany(models.PointsHistory, { foreignKey: 'user_id', as: 'pointsHistory' });
    UsersPoints.hasMany(models.MonthlyTotalPoints, { foreignKey: 'user_id', as: 'monthlyPoints' });
  };

  return UsersPoints;
};