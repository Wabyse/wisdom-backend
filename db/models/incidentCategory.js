module.exports = (sequelize, DataTypes) => {
    const IncidentCategories = sequelize.define('IncidentCategories', {
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
        deleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        deletedAt: {
            type: DataTypes.DATE,
        },
    }, {
        paranoid: true,
        tableName: 'incidents_categories',
        timestamps: true,
        updatedAt: false,
    });
    
    IncidentCategories.associate = (models) => {
        IncidentCategories.hasMany(models.IncidentSubCategory, { foreignKey: 'category', as: 'incidentSubCategories' });
    };

    return IncidentCategories;
}