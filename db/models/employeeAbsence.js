module.exports = (sequelize, DataTypes) => {
    const EmployeeAbsence = sequelize.define('EmployeeAbsence', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        comment: {
            type: DataTypes.TEXT,
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('absent', 'excused'),
        },
        employee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
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
        tableName: 'employees_absence',
        timestamps: true,
    });
        
    EmployeeAbsence.associate = (models) => {
        EmployeeAbsence.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
    };

    return EmployeeAbsence;
}