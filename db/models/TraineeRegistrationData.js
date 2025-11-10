module.exports = (sequelize, DataTypes) => {
    const TraineeRegistrationData = sequelize.define('TraineeRegistrationData', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        second_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        third_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        fourth_name: {
            type: DataTypes.STRING,
            allowNull: true
        },
        birth_date: {
            type: DataTypes.STRING,
            allowNull: false
        },
        vtc: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        gov: {
            type: DataTypes.STRING,
            allowNull: false
        },
        course: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
        certification: {
            type: DataTypes.STRING,
            allowNull: false
        },
        school: {
            type: DataTypes.STRING,
            allowNull: false
        },
        known_us: {
            type: DataTypes.STRING,
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(11),
            allowNull: false,
            validate: {
                isElevenDigits(value) {
                    const v = String(value ?? '').trim();
                    if (!/^\d{11}$/.test(v)) throw new Error('Phone must be exactly 11 digits');
                }
            }
        },
        whatsapp: {
            type: DataTypes.STRING(11),
            allowNull: false,
            validate: {
                isElevenDigits(value) {
                    const v = String(value ?? '').trim();
                    if (!/^\d{11}$/.test(v)) throw new Error('WhatsApp must be exactly 11 digits');
                }
            }
        },
        id_number: {
            type: DataTypes.STRING(14), // safer than INTEGER for 14 digits
            allowNull: false,
            validate: {
                isFourteenDigits(value) {
                    const v = String(value ?? '').trim();
                    if (!/^\d{14}$/.test(v)) {
                        throw new Error('ID number must be exactly 14 digits');
                    }
                }
            }
        },
        notes: {
            type: DataTypes.STRING,
            allowNull: true
        },
        is_new: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
    }, {
        paranoid: false,
        tableName: 'trainees_registration_data',
        timestamps: true,
    });

    TraineeRegistrationData.associate = (models) => {
        TraineeRegistrationData.belongsTo(models.Organization, { foreignKey: 'vtc', as: 'org' });
        TraineeRegistrationData.belongsTo(models.Curriculum, { foreignKey: 'course', as: 'curriculum' });
    };

    return TraineeRegistrationData;
}