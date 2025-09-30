'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('temp_org_avg_tasks', 'date');
    await queryInterface.addColumn('temp_org_avg_tasks', 'date', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('temp_org_avg_tasks', 'date');
    await queryInterface.addColumn('temp_org_avg_tasks', 'date', {
      type: Sequelize.DATE,
      allowNull: false
    });
  }
};