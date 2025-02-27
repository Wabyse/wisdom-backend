module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define('Organization', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      allowNull: false,
      type: DataTypes.ENUM('school', 'company', 'government', 'other'),
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
    tableName: 'organizations',
    timestamps: true,
    updatedAt: false,
  });

  Organization.associate = (models) => {
    Organization.hasMany(models.Employee, { foreignKey: 'organization_id', as: 'employees' });
    Organization.hasOne(models.School, { foreignKey: 'organizationId', as: 'school' });
    Organization.hasMany(models.Student, { foreignKey: 'school_id', as: 'students' });
    Organization.hasMany(models.SchoolDocument, { foreignKey: 'organization_id', as: 'documents' });
  };

  return Organization;
};
