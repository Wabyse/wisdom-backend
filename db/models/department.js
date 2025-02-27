module.exports = (sequelize, DataTypes) => {
    const Department = sequelize.define('Department', {
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
        tableName: 'departments',
        timestamps: true,
        updatedAt: false,
    });

    Department.associate = (models) => {
        Department.hasMany(models.Teacher, { foreignKey: 'department_id', as: 'teachers' });
        Department.hasMany(models.SchoolDocument, { foreignKey: 'department_id', as: 'documents' });
    };

    return Department;
}