'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('trainees_registration_data', 'is_new', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('trainees_registration_data', 'is_new');
  }
};