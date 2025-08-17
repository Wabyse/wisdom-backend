'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('trainees_registration_data', 'email', {
      type: Sequelize.STRING,
      allowNull: true,   // 👈 now nullable
    });

    await queryInterface.changeColumn('trainees_registration_data', 'fourth_name', {
      type: Sequelize.STRING,
      allowNull: true,   // 👈 now nullable
    });
  },

  async down(queryInterface, Sequelize) {
    // revert back to not null
    await queryInterface.changeColumn('trainees_registration_data', 'email', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('trainees_registration_data', 'fourth_name', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  }
};