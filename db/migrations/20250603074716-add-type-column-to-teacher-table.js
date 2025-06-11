'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('teachers', 'type', {
      type: Sequelize.ENUM('government', 'private'),
      allowNull: false,
      defaultValue: 'government',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('teachers', 'type');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_teachers_type";');
  }
};