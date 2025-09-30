module.exports = (sequelize, DataTypes) => {
  const ManagerComment = sequelize.define('ManagerComment', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    comment: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('ايجابي', 'سلبي'),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    employee_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  }, {
    paranoid: true,
    tableName: 'managers_comments',
    timestamps: true,
    updatedAt: false,
  });

  ManagerComment.associate = (models) => {
    ManagerComment.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
  };

  return ManagerComment;
};