'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // ✅ Required columns (NOT NULL)
    await queryInterface.changeColumn('pe_candidates', 'name', {
      type: Sequelize.TEXT,
      allowNull: false,
    });

    await queryInterface.changeColumn('pe_candidates', 'id_number', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.changeColumn('pe_candidates', 'candidate_id', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    });

    await queryInterface.changeColumn('pe_candidates', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    });

    // ✅ Make organization_id required (NO FK to avoid type conflict)
    await queryInterface.changeColumn('pe_candidates', 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // ✅ All other columns optional (NULL allowed)
    await queryInterface.changeColumn('pe_candidates', 'passport_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'user_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('pe_candidates', 'category', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'phone_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'recommended_country', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'theory_start_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'practical_start_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'fc_start_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'theory_end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'practical_end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'fc_end_date', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'theory_test_score', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'practical_test_score', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'fc_test_score', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'updatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert to previous state (optional)
    await queryInterface.changeColumn('pe_candidates', 'organization_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'name', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'id_number', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'candidate_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('pe_candidates', 'createdAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },
};