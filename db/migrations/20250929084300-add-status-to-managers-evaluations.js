'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('managers_evaluations', 'status', {
      type: Sequelize.ENUM('pending', 'confirmed'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('managers_evaluations', 'status');

    // ⚠️ Important for Postgres: drop the ENUM type after removing column
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_managers_evaluations_status";');
  }
};