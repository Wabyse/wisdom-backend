module.exports = (sequelize, DataTypes) => {
  const RewardsAndPunishments = sequelize.define('RewardsAndPunishments', {
    name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('school_reward', 'school_punishment', 'vtc_reward', 'vtc_punishment'),
      allowNull: false
    }
  }, {
    tableName: 'rewards_and_punishments',
    timestamps: true
  });

  RewardsAndPunishments.associate = function (models) {
    RewardsAndPunishments.hasMany(models.PointsHistory, { foreignKey: 'point_id', as: 'pointsHistory' });
  };

  return RewardsAndPunishments;
};