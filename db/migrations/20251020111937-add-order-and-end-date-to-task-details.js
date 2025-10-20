'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('task_details', 'order', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn('task_details', 'end_date', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('task_details', 'order');
    await queryInterface.removeColumn('task_details', 'end_date');
  },
};
