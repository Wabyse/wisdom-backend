'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('environment_reports', 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 3,
    });

    await queryInterface.addConstraint('environment_reports', {
      fields: ['organization_id'],
      type: 'foreign key',
      name: 'fk_environment_reports_organization_id',
      references: {
        table: 'organizations',
        field: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('environment_reports', 'fk_environment_reports_organization_id');
    await queryInterface.removeColumn('environment_reports', 'organization_id');
  }
};