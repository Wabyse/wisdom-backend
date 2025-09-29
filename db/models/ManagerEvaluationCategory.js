module.exports = (sequelize, DataTypes) => {
    const ManagerEvaluationCategory = sequelize.define('ManagerEvaluationCategory', {
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
            allowNull: false,
            defaultValue: false,
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'managers_evaluation_categories',
        timestamps: true,
        updatedAt: false,
    });

    ManagerEvaluationCategory.associate = (models) => {
        ManagerEvaluationCategory.hasMany(models.ManagerEvaluationTemplate, { foreignKey: 'category_id', as: 'templates' });
    };

    return ManagerEvaluationCategory;
}