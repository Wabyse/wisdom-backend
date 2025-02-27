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
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'departments',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        organizationId: {
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
        SchoolDocument.belongsTo(models.Department, { foreignKey: 'department_id', as: 'department' });
        SchoolDocument.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' });
    };

    return SchoolDocument;
}