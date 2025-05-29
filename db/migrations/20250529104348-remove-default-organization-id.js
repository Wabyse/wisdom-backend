'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('environment_reports', 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('environment_reports', 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 3,
    });
  }
};