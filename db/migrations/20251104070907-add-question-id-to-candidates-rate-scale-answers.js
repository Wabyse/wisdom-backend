'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('candidates_rate_scale_answers', 'question_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'rating_scale_questions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('candidates_rate_scale_answers', 'question_id');
  }
};