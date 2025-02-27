module.exports = (sequelize, DataTypes) => {
    const Subject = sequelize.define('Subject', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
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
        tableName: 'subjects',
        timestamps: true,
        updatedAt: false,
    });

    Subject.associate = (models) => {
        Subject.hasMany(models.Curriculum, { foreignKey: 'subject_id', as: 'curriculums' });
        Subject.hasMany(models.SubjectSpecialization, { foreignKey: 'subject_id', as: 'specializations' });
        Subject.hasMany(models.Teacher, { foreignKey: 'subject_id', as: 'teachers' });
        Subject.hasMany(models.QuizzesTestsTemplate, { foreignKey: 'subject_id', as: 'quizzes' });
    };

    return Subject;
}