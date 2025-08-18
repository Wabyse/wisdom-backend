module.exports = (sequelize, DataTypes) => {
    const DocSubCategory = sequelize.define('DocSubCategory', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        category: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'document_categories',
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
        tableName: 'document_sub_categories',
        timestamps: true,
        updatedAt: false,
    });

    DocSubCategory.associate = (models) => {
        DocSubCategory.belongsTo(models.DocCategory, { foreignKey: 'category', as: 'documentCategory' });
        DocSubCategory.hasMany(models.SchoolDocument, { foreignKey: 'sub_category', as: 'documents' });
        DocSubCategory.hasMany(models.WatomsWorkshopDocumentSubCategory, { foreignKey: 'sub_category_id', as: 'organizations'  });
    };

    return DocSubCategory;
}