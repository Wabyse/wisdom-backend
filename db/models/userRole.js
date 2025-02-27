module.exports = (sequelize, DataTypes) => {
    const UserRole = sequelize.define('UserRole', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        title: {
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
        tableName: 'users_role',
        timestamps: true,
        updatedAt: false,
    });

    UserRole.associate = (models) => {
        UserRole.hasMany(models.User, { foreignKey: 'role_id', as: 'users' });
    };

    return UserRole;
}