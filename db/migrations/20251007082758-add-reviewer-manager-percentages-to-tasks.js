'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tasks', 'reviewer_speed_percentage', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('tasks', 'manager_speed_percentage', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('tasks', 'reviewer_quality_percentage', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    await queryInterface.addColumn('tasks', 'manager_quality_percentage', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tasks', 'reviewer_speed_percentage');
    await queryInterface.removeColumn('tasks', 'manager_speed_percentage');
    await queryInterface.removeColumn('tasks', 'reviewer_quality_percentage');
    await queryInterface.removeColumn('tasks', 'manager_quality_percentage');
  }
};