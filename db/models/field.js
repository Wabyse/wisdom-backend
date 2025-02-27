module.exports = (sequelize, DataTypes) => {
    const Field = sequelize.define('Field', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        en_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ar_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING
        },
        weight: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        form_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'forms',
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
        tableName: 'fields',
        timestamps: true,
        updatedAt: false,
    });

    Field.associate = (models) => {
        Field.belongsTo(models.Form, { foreignKey: 'form_id', as: 'form' });
        Field.hasMany(models.SubField, { foreignKey: 'field_id', as: 'sub_fields' })
    };

    return Field;
}