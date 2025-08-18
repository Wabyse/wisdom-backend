'use strict';

module.exports = (sequelize, DataTypes) => {
    const WatomsWorkshopDocumentSubCategory = sequelize.define('WatomsWorkshopDocumentSubCategory', {
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        sub_category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'document_sub_categories',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        }
    }, {
        tableName: 'watoms_workshops_document_sub_category',
        timestamps: false,
    });

    WatomsWorkshopDocumentSubCategory.associate = (models) => {
        WatomsWorkshopDocumentSubCategory.belongsTo(models.DocSubCategory, { foreignKey: 'sub_category_id', as: 'sub_category' });
        WatomsWorkshopDocumentSubCategory.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' });
    };

    return WatomsWorkshopDocumentSubCategory;
};