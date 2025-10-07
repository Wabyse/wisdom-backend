'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tasks', 'reviewer_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });

    await queryInterface.addColumn('tasks', 'manager_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'employees',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tasks', 'reviewer_id');
    await queryInterface.removeColumn('tasks', 'manager_id');
  }
};