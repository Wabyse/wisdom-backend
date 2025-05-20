'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('employee_check_in_outs', 'latitude', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('employee_check_in_outs', 'longitude', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.removeColumn('employee_check_in_outs', 'location');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('employee_check_in_outs', 'location', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn('employee_check_in_outs', 'latitude');
    await queryInterface.removeColumn('employee_check_in_outs', 'longitude');
  }
};
