module.exports = (sequelize, DataTypes) => {
  const Alarm = sequelize.define('Alarm', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER, // ✅ matches User.id
      allowNull: false,
    },
    label: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    days: {
      type: DataTypes.ARRAY(DataTypes.INTEGER), // e.g. [1,3,5]
      allowNull: true,
    },
    oneTime: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    triggered: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'alarms',
    timestamps: true,
  });

  Alarm.associate = (models) => {
    // ✅ userId now correctly references User.id (integer)
    Alarm.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return Alarm;
};