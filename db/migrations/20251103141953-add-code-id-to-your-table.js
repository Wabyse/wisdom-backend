'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('rating_scale_questions', 'code_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'exam_result_codes',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('rating_scale_questions', 'code_id');
  }
};