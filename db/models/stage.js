module.exports = (sequelize, DataTypes) => {
    const Stage = sequelize.define('Stage', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING
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
        tableName: 'stages',
        timestamps: true,
        updatedAt: false,
    });

    Stage.associate = (models) => {
        Stage.hasMany(models.Class, { foreignKey: 'stage_id', as: 'classes' });
    };

    return Stage;
}