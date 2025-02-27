module.exports = (sequelize, DataTypes) => {
    const Student = sequelize.define('Student', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        first_name: {
            type: DataTypes.STRING,
        },
        middle_name: {
            type: DataTypes.STRING,
        },
        last_name: {
            type: DataTypes.STRING,
        },
        birth_date: {
            type: DataTypes.DATEONLY
        },
        address: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        class_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'classes',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        specialization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'specializations',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        school_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'students',
        timestamps: true,
        updatedAt: false,
    });

    Student.associate = (models) => {
        Student.hasMany(models.QuizTest, { foreignKey: 'student_id', as: 'quizzes' });
        Student.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Student.belongsTo(models.Class, { foreignKey: 'class_id', as: 'class' });
        Student.belongsTo(models.Specialization, { foreignKey: 'specialization_id', as: 'specialization' });
        Student.belongsTo(models.Organization, { foreignKey: 'school_id', as: 'school' });
        Student.hasMany(models.studentAttendance, { foreignKey: 'student_id', as: 'attendance' });
    };

    return Student;
}