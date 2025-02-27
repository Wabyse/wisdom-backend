module.exports = (sequelize, DataTypes) => {
    const studentBehaviorCategory = sequelize.define('studentBehaviorCategory', {
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
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'students_behavior_categories',
        timestamps: true,
        updatedAt: false,
    });

    studentBehaviorCategory.associate = (models) => {
        studentBehaviorCategory.hasMany(models.studentBehaviorType, { foreignKey: 'category', as: 'behaviorType' });
    };

    return studentBehaviorCategory;
}