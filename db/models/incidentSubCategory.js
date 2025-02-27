module.exports = (sequelize, DataTypes) => {
    const IncidentSubCategory = sequelize.define('IncidentSubCategory', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'incidents_categories',
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
        tableName: 'incidents_sub_categories',
        timestamps: true,
        updatedAt: false,
    });

    IncidentSubCategory.associate = (models) => {
        IncidentSubCategory.hasMany(models.Incident, { foreignKey: 'sub_category', as: 'incidents' });
        IncidentSubCategory.belongsTo(models.IncidentCategories, { foreignKey: 'category', as: 'incidentCategory' });
    };

    return IncidentSubCategory;
}