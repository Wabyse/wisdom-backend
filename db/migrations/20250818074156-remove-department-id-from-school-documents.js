'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) Drop the FK constraint (safe if it exists)
    await queryInterface.sequelize.query(`
      ALTER TABLE "school_documents"
      DROP CONSTRAINT IF EXISTS "school_documents_department_id_fkey";
    `);

    // 2) Remove the column
    await queryInterface.removeColumn('school_documents', 'department_id');
  },

  async down(queryInterface, Sequelize) {
    // Re-add the column and FK if you ever rollback
    await queryInterface.addColumn('school_documents', 'department_id', {
      type: Sequelize.INTEGER,
      allowNull: false, // <-- if this causes issues on rollback due to existing rows, change to true temporarily
      references: {
        model: 'departments',
        key: 'id',
      },
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    });

    // (Optional) If you want to explicitly add the FK (addColumn already does this in most setups)
    await queryInterface.sequelize.query(`
      ALTER TABLE "school_documents"
      ADD CONSTRAINT "school_documents_department_id_fkey"
      FOREIGN KEY ("department_id") REFERENCES "departments" ("id")
      ON UPDATE CASCADE ON DELETE RESTRICT;
    `);
  }
};