module.exports = (sequelize, DataTypes) => {
    const SchoolDocument = sequelize.define('SchoolDocument', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        file_path: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        sub_category: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'document_sub_categories',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'departments',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'organizations',
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
        tableName: 'school_documents',
        timestamps: true,
        updatedAt: false,
    });

    SchoolDocument.associate = (models) => {
        SchoolDocument.belongsTo(models.DocSubCategory, { foreignKey: 'sub_category', as: 'documentSubCategory' });
        SchoolDocument.belongsTo(models.User, { foreignKey: 'user_id', as: 'uploader' });
        SchoolDocument.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
        SchoolDocument.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' });
        SchoolDocument.hasOne(models.WatomsEmployeeDocumentCategory, { foreignKey: 'document_id' });
    };

    return SchoolDocument;
}