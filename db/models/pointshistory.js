module.exports = (sequelize, DataTypes) => {
  const PointsHistory = sequelize.define('PointsHistory', {
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'admins_users',
        key: 'id'
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users_points',
        key: 'id'
      },
    },
    point_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'rewards_and_punishments',
        key: 'id'
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'denied', 'accepted'),
      allowNull: false,
      defaultValue: 'pending'
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'points_history',
    timestamps: true,
    paranoid: true
  });

  PointsHistory.associate = function (models) {
    PointsHistory.belongsTo(models.AdminsUsers, { foreignKey: 'admin_id', as: 'admin' });
    PointsHistory.belongsTo(models.UsersPoints, { foreignKey: 'user_id', as: 'userPoints' });
    PointsHistory.belongsTo(models.RewardsAndPunishments, { foreignKey: 'point_id', as: 'point' });
  };

  return PointsHistory;
};