module.exports = (sequelize, DataTypes) => {
    const Class = sequelize.define('Class', {
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
        no_of_student: {
            type: DataTypes.INTEGER
        },
        no_of_teachers: {
            type: DataTypes.INTEGER
        },
        classRoom_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'classRooms',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        stage_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'stages',
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
        tableName: 'classes',
        timestamps: true,
        updatedAt: false,
    });

    Class.associate = (models) => {
        Class.belongsTo(models.ClassRoom, { foreignKey: 'classRoom_id', as: 'classRoom' });
        Class.belongsTo(models.Stage, { foreignKey: 'stage_id', as: 'stage' });
        Class.hasMany(models.Session, { foreignKey: 'class_id', as: 'sessions' });
        Class.hasMany(models.Student, { foreignKey: 'class_id', as: 'students' });
    };

    return Class;
}