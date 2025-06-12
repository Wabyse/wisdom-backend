'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('curriculums_reports', 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id'
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('curriculums_reports', 'organization_id');
  }
};
