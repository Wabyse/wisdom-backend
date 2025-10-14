module.exports = (sequelize, DataTypes) => {
    const Employee = sequelize.define('Employee', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        middle_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        birth_date: {
            type: DataTypes.DATEONLY
        },
        address: {
            type: DataTypes.STRING
        },
        qualification: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees_role',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'id',
            },
            onDelete: 'RESTRICT'
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
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'employees',
        timestamps: true,
        updatedAt: false,
    });

    Employee.associate = (models) => {
        Employee.belongsTo(models.EmployeeRole, { foreignKey: 'role_id', as: 'role' });
        Employee.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' });
        Employee.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        Employee.hasMany(models.EmployeeAbsence, { foreignKey: 'employee_id', as: 'absences' });
        Employee.hasMany(models.Substitute, { foreignKey: 'substitute_id', as: 'replacement' });
        Employee.hasMany(models.Substitute, { foreignKey: 'replacement_id', as: 'substitute' });
        Employee.hasOne(models.Teacher, { foreignKey: 'employee_id', as: 'teacher' });
        Employee.hasMany(models.WorkLatness, { foreignKey: 'emp_id', as: 'latness' });
        Employee.hasMany(models.TeacherEvaluation, { foreignKey: 'employee_id', as: 'evaluates' });
        Employee.hasMany(models.WatomsEmployeeDocumentCategory, { foreignKey: 'employee_id' });
        Employee.hasMany(models.ManagerEvaluation, { foreignKey: 'employee_id', as: 'manager_evaluations' });
        Employee.hasMany(models.ManagerComment, { foreignKey: 'employee_id', as: 'employee' });
    };

    return Employee;
}