"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("program_forms", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      program_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "programs", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      form_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "forms", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },

      // optional extra columns on the relation:
      // sort_order: { type: Sequelize.INTEGER, allowNull: true },
      // is_required: { type: Sequelize.BOOLEAN, defaultValue: false },

      createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") },
      updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.fn("NOW") }
    });

    // prevent duplicate pairs (program_id, form_id)
    await queryInterface.addConstraint("program_forms", {
      fields: ["program_id", "form_id"],
      type: "unique",
      name: "uq_program_forms_program_form"
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("program_forms");
  }
};