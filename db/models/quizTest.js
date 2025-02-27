module.exports = (sequelize, DataTypes) => {
    const QuizTest = sequelize.define('QuizTest', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        result: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        teacher_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'teachers',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        student_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'students',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        template_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'quizzes_and_tests_template',
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
        tableName: 'quizzes_and_tests',
        timestamps: true,
        updatedAt: false,
    });

    QuizTest.associate = (models) => {
        QuizTest.belongsTo(models.Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
        QuizTest.belongsTo(models.Student, { foreignKey: 'student_id', as: 'student' });
        QuizTest.belongsTo(models.QuizzesTestsTemplate, { foreignKey: 'template_id', as: 'template' });
    };

    return QuizTest;
}