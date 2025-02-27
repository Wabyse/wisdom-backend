module.exports = (sequelize, DataTypes) => {
    const EmployeeRole = sequelize.define('EmployeeRole', {
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
        tableName: 'employees_role',
        timestamps: true,
        updatedAt: false,
    });

    EmployeeRole.associate = (models) => {
        EmployeeRole.hasMany(models.Employee, { foreignKey: 'role_id', as: 'employees' });
    };

    return EmployeeRole;
}