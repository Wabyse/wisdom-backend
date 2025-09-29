module.exports = (sequelize, DataTypes) => {
    const ManagerEvaluation = sequelize.define('ManagerEvaluation', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        date: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'confirmed'),
            allowNull: false,
            defaultValue: 'pending'
        },
        template_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'managers_evaluation_template',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        employee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id'
            }
        },
        deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'managers_evaluations',
        timestamps: true,
        updatedAt: false,
    });

    ManagerEvaluation.associate = (models) => {
        ManagerEvaluation.belongsTo(models.ManagerEvaluationTemplate, { foreignKey: 'template_id', as: 'template' });
        ManagerEvaluation.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
    };

    return ManagerEvaluation;
}