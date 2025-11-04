'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Add new column 'type'
    await queryInterface.addColumn('exams', 'type', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // ✅ Remove 'updatedAt' column
    await queryInterface.removeColumn('exams', 'updatedAt');
  },

  async down(queryInterface, Sequelize) {
    // Rollback: remove 'type' and re-add 'updatedAt'
    await queryInterface.removeColumn('exams', 'type');

    await queryInterface.addColumn('exams', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW')
    });
  }
};