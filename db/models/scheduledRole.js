module.exports = (sequelize, DataTypes) => {
    const ScheduledRole = sequelize.define('ScheduledRole', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        employee_role: {
            type: DataTypes.STRING
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        active_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        expiration_date: {
            type: DataTypes.DATE,
            allowNull: false,
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
        tableName: 'scheduled_roles',
        timestamps: true,
    });

    ScheduledRole.associate = (models) => {
        ScheduledRole.belongsTo(models.User, { foreignKey: 'user_id', as: 'employee' });
    };

    return ScheduledRole;
}