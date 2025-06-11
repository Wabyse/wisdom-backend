'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE teacher_latness
      ALTER COLUMN late TYPE INTEGER USING EXTRACT(EPOCH FROM late)::INTEGER
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      ALTER TABLE teacher_latness
      ALTER COLUMN late TYPE DATE USING TO_TIMESTAMP(late)
    `);
  }
};