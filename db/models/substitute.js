module.exports = (sequelize, DataTypes) => {
    const Substitute = sequelize.define('Substitute', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        substitute_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        replacement_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        session_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        reason: {
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
        tableName: 'substitutes',
        timestamps: true,
        updatedAt: false,
    });

    Substitute.associate = (models) => {
        Substitute.belongsTo(models.Employee, { foreignKey: 'substitute_id', as: 'substitute' });
        Substitute.belongsTo(models.Employee, { foreignKey: 'replacement_id', as: 'replacement' });
        Substitute.belongsTo(models.Session, { foreignKey: 'session_id', as: 'session' });
    };

    return Substitute;
}