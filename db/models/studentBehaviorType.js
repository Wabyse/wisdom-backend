module.exports = (sequelize, DataTypes) => {
    const studentBehaviorType = sequelize.define('studentBehaviorType', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING,
        },
        category: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'students_behavior_categories',
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
        tableName: 'students_behavior_types',
        timestamps: true,
        updatedAt: false,
    });

    studentBehaviorType.associate = (models) => {
        studentBehaviorType.hasMany(models.studentBehavior, { foreignKey: 'type', as: 'behaviors' });
        studentBehaviorType.belongsTo(models.studentBehaviorCategory, { foreignKey: 'category', as: 'behaviorCategories' });
    };

    return studentBehaviorType;
}