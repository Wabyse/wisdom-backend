module.exports = (sequelize, DataTypes) => {
    const WorkLatness = sequelize.define('WorkLatness', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        time_of_arrival: {
            type: DataTypes.DATE
        },
        reason: {
            type: DataTypes.TEXT
        },
        emp_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id',
            },
            onDelete: "RESTRICT",
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
        tableName: 'work_latness',
        timestamps: true,
        updatedAt: false,
    });

    WorkLatness.associate = (models) => {
        WorkLatness.belongsTo(models.Employee, { foreignKey: 'emp_id', as: 'employee' });
    };

    return WorkLatness;
}