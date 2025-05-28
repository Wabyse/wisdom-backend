module.exports = (sequelize, DataTypes) => {
  const AdminsUsers = sequelize.define('AdminsUsers', {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
    },
    role: {
      type: DataTypes.ENUM('admin', 'super_admin', 'ceo'),
      allowNull: false
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE
    }
  }, {
    tableName: 'admins_users',
    timestamps: true,
    paranoid: true
  });

  AdminsUsers.associate = function (models) {
    AdminsUsers.belongsTo(models.User, { foreignKey: 'user_id', as: 'userPoints' });
    AdminsUsers.hasMany(models.PointsHistory, { foreignKey: 'admin_id', as: 'points' });
  };

  return AdminsUsers;
};