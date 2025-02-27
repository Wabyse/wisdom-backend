module.exports = (sequelize, DataTypes) => {
    const ClassRoom = sequelize.define('ClassRoom', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        Name: {
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
        tableName: 'classRooms',
        timestamps: true,
        updatedAt: false,
    });

    ClassRoom.associate = (models) => {
        ClassRoom.hasMany(models.Class, { foreignKey: 'classRoom_id', as: 'classes' });
    };

    return ClassRoom;
}