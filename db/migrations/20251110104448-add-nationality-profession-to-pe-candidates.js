'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('pe_candidates', 'nationality', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('pe_candidates', 'profession', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('pe_candidates', 'profession_code', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('pe_candidates', 'profession_code');
    await queryInterface.removeColumn('pe_candidates', 'profession');
    await queryInterface.removeColumn('pe_candidates', 'nationality');
  }
};