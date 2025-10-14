module.exports = (sequelize, DataTypes) => {

  const User = sequelize.define('User', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    code: {
      allowNull: false,
      type: DataTypes.INTEGER,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users_role',
        key: 'id',
      },
      onDelete: 'RESTRICT',
    },
    deleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE,
    },
  }, {
    paranoid: true,
    tableName: 'users',
    timestamps: true,
    updatedAt: false,
  });

  User.associate = (models) => {
    User.belongsTo(models.UserRole, { foreignKey: 'role_id', as: 'role' });
    User.hasMany(models.CurriculumReport, { foreignKey: 'Assessor_id', as: 'reports' });
    User.hasMany(models.SchoolDocument, { foreignKey: 'user_id', as: 'documents' });
    User.hasOne(models.Employee, { foreignKey: 'user_id', as: 'employee' });
    User.hasMany(models.IndividualReport, { foreignKey: 'Assessor_id', as: 'assessorReports' });
    User.hasMany(models.IndividualReport, { foreignKey: 'Assessee_id', as: 'assesseeReports' });
    User.hasOne(models.Student, { foreignKey: 'user_id', as: 'student' });
    User.hasMany(models.studentBehavior, { foreignKey: 'offender_id', as: 'offender_behaviors' });
    User.hasMany(models.studentBehavior, { foreignKey: 'social_worker_id', as: 'social_worker_behaviors' });
    User.hasMany(models.ScheduledRole, { foreignKey: 'user_id', as: 'assignedRole' });
    User.hasMany(models.EnvironmentReports, { foreignKey: 'user_id', as: 'envReports' });
    User.hasMany(models.EmployeeCheckInOut, { foreignKey: 'user_id', as: 'empCheckInOut' });
    User.hasOne(models.UsersPoints, { foreignKey: 'user_id', as: 'points' });
    User.hasOne(models.AdminsUsers, { foreignKey: 'user_id', as: 'admin' });
    User.hasMany(models.Task, { foreignKey: 'assigner_id', as: 'task_assigner' });
    User.hasMany(models.Task, { foreignKey: 'assignee_id', as: 'task_assignee' });
    User.hasMany(models.Task, { foreignKey: 'reviewer_id', as: 'task_reviewer' });
    User.hasMany(models.Task, { foreignKey: 'manager_id', as: 'task_manager' });
  };

  return User;
};
