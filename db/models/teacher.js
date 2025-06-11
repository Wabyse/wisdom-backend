module.exports = (sequelize, DataTypes) => {
    const Teacher = sequelize.define('Teacher', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        planned_sessions: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_sessions: {
            type: DataTypes.INTEGER,
        },
        type: {
            type: DataTypes.ENUM('government', 'private'),
            allowNull: false,
            defaultValue: 'government',
        },
        employee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        subject_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'subjects',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'departments',
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
        tableName: 'teachers',
        timestamps: true,
    });

    Teacher.associate = (models) => {
        Teacher.hasMany(models.QuizTest, { foreignKey: 'teacher_id', as: 'quizzes' });
        Teacher.hasMany(models.Session, { foreignKey: 'teacher_id', as: 'sessions' });
        Teacher.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
        Teacher.belongsTo(models.Subject, { foreignKey: 'subject_id', as: 'subject' });
        Teacher.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
        Teacher.hasMany(models.TeacherSessionHistory, { foreignKey: 'teacher_id', as: 'history' });
        Teacher.hasMany(models.TeacherLatness, { foreignKey: 'teacher_id', as: 'lateness' });
        Teacher.hasMany(models.TeacherEvaluation, { foreignKey: 'teacher_id', as: 'evaluation' });
    };

    return Teacher;
}