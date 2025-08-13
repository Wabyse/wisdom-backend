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
            allowNull: false
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
            allowNull: false
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
        notes: {
            type: DataTypes.STRING,
            allowNull: true
        },
    }, {
        paranoid: false,
        tableName: 'trainees_registration_data',
        timestamps: true,
    });

    return TraineeRegistrationData;
}