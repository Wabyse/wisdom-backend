module.exports = (sequelize, DataTypes) => {
    const ManagerEvaluationTemplate = sequelize.define('ManagerEvaluationTemplate', {
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
        max_score: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'managers_evaluation_categories',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
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
        tableName: 'managers_evaluation_template',
        timestamps: true,
        updatedAt: false,
    });

    ManagerEvaluationTemplate.associate = (models) => {
        ManagerEvaluationTemplate.belongsTo(models.ManagerEvaluationCategory, { foreignKey: 'category_id', as: 'category' });
        ManagerEvaluationTemplate.hasMany(models.ManagerEvaluation, { foreignKey: 'template_id', as: 'evaluations' });
    };

    return ManagerEvaluationTemplate;
}