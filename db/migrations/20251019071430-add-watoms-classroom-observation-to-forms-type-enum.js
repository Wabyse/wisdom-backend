'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_forms_type" ADD VALUE IF NOT EXISTS 'Watoms ClassRoom Observation';
    `);
  },

  async down(queryInterface, Sequelize) {
    // PostgreSQL does not support removing enum values directly.
    // A manual process is required if you truly need to rollback this.
    console.warn('Skipping removal of enum value "Watoms ClassRoom Observation" — not supported by PostgreSQL.');
  }
};