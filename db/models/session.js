module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define('Session', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
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
        tableName: 'sessions',
        timestamps: true,
        updatedAt: false,
    });

    Session.associate = (models) => {
        Session.hasMany(models.CurriculumUnit, { foreignKey: 'session_id', as: 'units' });
        Session.belongsTo(models.Class, { foreignKey: 'class_id', as: 'class' });
        Session.belongsTo(models.Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
        Session.hasMany(models.Substitute, { foreignKey: 'session_id', as: 'substitutes' });
    };

    return Session;
}