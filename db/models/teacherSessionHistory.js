module.exports = (sequelize, DataTypes) => {
    const TeacherSessionHistory = sequelize.define('TeacherSessionHistory', {
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
        real_sessions: {
            type: DataTypes.INTEGER,
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
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'teachers_sessions_history',
        timestamps: true,
        updatedAt: false,
    });

    TeacherSessionHistory.associate = (models) => {
        TeacherSessionHistory.belongsTo(models.Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
    };

    return TeacherSessionHistory;
}