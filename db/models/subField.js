module.exports = (sequelize, DataTypes) => {
    const SubField = sequelize.define('SubField', {
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
        field_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'fields',
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
        tableName: 'sub_fields',
        timestamps: true,
        updatedAt: false,
    });

    SubField.associate = (models) => {
        SubField.belongsTo(models.Field, { foreignKey: 'field_id', as: 'field' });
        SubField.hasMany(models.Question, { foreignKey: 'sub_field_id', as: 'questions' })
    };

    return SubField;
}