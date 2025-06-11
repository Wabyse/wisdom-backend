module.exports = (sequelize, DataTypes) => {
    const TeacherLatness = sequelize.define('TeacherLatness', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        late: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reason: {
            type: DataTypes.TEXT
        },
        teacher_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'teachers',
                key: 'id',
            },
            onDelete: "RESTRICT",
        },
        session_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
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
        tableName: 'teacher_latness',
        timestamps: true,
        updatedAt: false,
    });

    TeacherLatness.associate = (models) => {
        TeacherLatness.belongsTo(models.Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
        TeacherLatness.belongsTo(models.Session, { foreignKey: 'session_id', as: 'session' });
    };

    return TeacherLatness;
}