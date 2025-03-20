module.exports = (sequelize, DataTypes) => {
    const studentBehavior = sequelize.define('studentBehavior', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        comment: {
            type: DataTypes.TEXT,
        },
        offender_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        social_worker_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        type: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'students_behavior_types',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        behavior_date: {
            type: DataTypes.DATE,
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
        tableName: 'students_behavior',
        timestamps: true,
        updatedAt: false,
    });

    studentBehavior.associate = (models) => {
        studentBehavior.belongsTo(models.User, { foreignKey: 'offender_id', as: 'offender' });
        studentBehavior.belongsTo(models.User, { foreignKey: 'social_worker_id', as: 'social_worker' });
        studentBehavior.belongsTo(models.studentBehaviorType, { foreignKey: 'type', as: 'behaviorType' });
    };

    return studentBehavior;
}