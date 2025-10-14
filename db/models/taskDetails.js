module.exports = (sequelize, DataTypes) => {
  const TaskDetail = sequelize.define('TaskDetail', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    task_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tasks',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'task_details',
    timestamps: false, // no createdAt or updatedAt
    paranoid: false,   // we manage deletion manually with deleted + deletedAt
  });

  TaskDetail.associate = (models) => {
    TaskDetail.belongsTo(models.Task, { foreignKey: 'task_id', as: 'task' });
  };

  return TaskDetail;
};