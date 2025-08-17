'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('trainees_registration_data', 'id_number', {
      type: Sequelize.STRING(14),   // up to 14 chars
      allowNull: true,              // nullable for now
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('trainees_registration_data', 'id_number');
  }
};
