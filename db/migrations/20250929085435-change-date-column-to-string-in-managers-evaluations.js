'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('managers_evaluations', 'date', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('managers_evaluations', 'date', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};