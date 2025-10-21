'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('tasks', 'title', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn('tasks', 'description', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.addColumn('tasks', 'note', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('tasks', 'title');
    await queryInterface.removeColumn('tasks', 'description');
    await queryInterface.removeColumn('tasks', 'note');
  },
};