// models/employeecheckinout.js
module.exports = (sequelize, DataTypes) => {
  const EmployeeCheckInOut = sequelize.define('EmployeeCheckInOut', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'employee_check_in_outs',
    timestamps: true,
    updatedAt: false,
  });

  EmployeeCheckInOut.associate = (models) => {
    EmployeeCheckInOut.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return EmployeeCheckInOut;
};