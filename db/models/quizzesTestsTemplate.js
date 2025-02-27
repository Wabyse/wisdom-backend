module.exports = (sequelize, DataTypes) => {
    const QuizzesTestsTemplate = sequelize.define('QuizzesTestsTemplate', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('in progress', 'done', 'not started yet', 'terminated', 'under review', 'suspended due to circumstances'),
        },
        type: {
            allowNull: false,
            type: DataTypes.ENUM('test', 'quiz'),
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
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'quizzes_and_tests_template',
        timestamps: true,
    });

    QuizzesTestsTemplate.associate = (models) => {
        QuizzesTestsTemplate.hasMany(models.QuizTest, { foreignKey: 'template_id', as: 'quizzes' });
        QuizzesTestsTemplate.belongsTo(models.Subject, { foreignKey: 'subject_id', as: 'subject' });
    };

    return QuizzesTestsTemplate;
}