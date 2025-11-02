'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 🧩 Rename old columns
    await queryInterface.renameColumn('pe_candidates', 'theory_test_date', 'theory_start_date');
    await queryInterface.renameColumn('pe_candidates', 'self_test_date', 'practical_start_date');
    await queryInterface.renameColumn('pe_candidates', 'personal_test_date', 'fc_start_date');

    // 🆕 Add new columns
    await queryInterface.addColumn('pe_candidates', 'theory_end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('pe_candidates', 'practical_end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('pe_candidates', 'fc_end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });

    await queryInterface.addColumn('pe_candidates', 'theory_test_score', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('pe_candidates', 'practical_test_score', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('pe_candidates', 'fc_test_score', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // 🔄 Revert the changes if rolled back
    await queryInterface.renameColumn('pe_candidates', 'theory_start_date', 'theory_test_date');
    await queryInterface.renameColumn('pe_candidates', 'practical_start_date', 'self_test_date');
    await queryInterface.renameColumn('pe_candidates', 'fc_start_date', 'personal_test_date');

    await queryInterface.removeColumn('pe_candidates', 'theory_end_date');
    await queryInterface.removeColumn('pe_candidates', 'practical_end_date');
    await queryInterface.removeColumn('pe_candidates', 'fc_end_date');
    await queryInterface.removeColumn('pe_candidates', 'theory_test_score');
    await queryInterface.removeColumn('pe_candidates', 'practical_test_score');
    await queryInterface.removeColumn('pe_candidates', 'fc_test_score');
  },
};