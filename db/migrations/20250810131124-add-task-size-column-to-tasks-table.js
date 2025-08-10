'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tasks', 'task_size', {
      type: Sequelize.ENUM('small', 'medium', 'large'),
      allowNull: false,
      defaultValue: 'small',
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the column first
    await queryInterface.removeColumn('tasks', 'task_size');

    // Drop the ENUM type (important for Postgres)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Tasks_task_size";');
  }
};