'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('managers_evaluations', 'date');
    await queryInterface.addColumn('managers_evaluations', 'date', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('managers_evaluations', 'date');
    await queryInterface.addColumn('managers_evaluations', 'date', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};