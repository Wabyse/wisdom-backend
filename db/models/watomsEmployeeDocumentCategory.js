'use strict';

module.exports = (sequelize, DataTypes) => {
  const WatomsEmployeeDocumentCategory = sequelize.define('WatomsEmployeeDocumentCategory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    employee_id: { type: DataTypes.INTEGER, allowNull: false },
    document_id: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'watoms_employees_document_category',
    timestamps: false,
  });

  WatomsEmployeeDocumentCategory.associate = (models) => {
    WatomsEmployeeDocumentCategory.belongsTo(models.Employee, { foreignKey: 'employee_id' });
    WatomsEmployeeDocumentCategory.belongsTo(models.SchoolDocument, { foreignKey: 'document_id' });
  };

  return WatomsEmployeeDocumentCategory;
};
