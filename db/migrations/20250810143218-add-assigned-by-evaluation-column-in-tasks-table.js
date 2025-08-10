'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tasks', 'assigned_by_evaluation', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the column first
    await queryInterface.removeColumn('tasks', 'assigned_by_evaluation');
  }
};