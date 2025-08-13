'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('trainees_registration_data', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      second_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      third_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fourth_name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      birth_date: {
        type: Sequelize.STRING,
        allowNull: false
      },
      vtc: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      gov: {
        type: Sequelize.STRING,
        allowNull: false
      },
      course: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      certification: {
        type: Sequelize.STRING,
        allowNull: false
      },
      school: {
        type: Sequelize.STRING,
        allowNull: false
      },
      known_us: {
        type: Sequelize.STRING,
        allowNull: false
      },
      phone: {
        type: Sequelize.STRING(11),
        allowNull: false,
        validate: {
          isElevenDigits(value) {
            const v = String(value ?? '').trim();
            if (!/^\d{11}$/.test(v)) throw new Error('Phone must be exactly 11 digits');
          }
        }
      },
      whatsapp: {
        type: Sequelize.STRING(11),
        allowNull: false,
        validate: {
          isElevenDigits(value) {
            const v = String(value ?? '').trim();
            if (!/^\d{11}$/.test(v)) throw new Error('WhatsApp must be exactly 11 digits');
          }
        }
      },
      notes: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('NOW')
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('trainees_registration_data');
  }
};