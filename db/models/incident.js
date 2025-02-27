module.exports = (sequelize, DataTypes) => {
    const Incident = sequelize.define('Incident', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        comment: {
            type: DataTypes.TEXT
        },
        school_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'schools',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        sub_category: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'incidents_sub_categories',
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
        tableName: 'incidents',
        timestamps: true,
        updatedAt: false,
    });

    Incident.associate = (models) => {
        Incident.belongsTo(models.School, { foreignKey: 'school_id', as: 'school' });
        Incident.belongsTo(models.IncidentSubCategory, { foreignKey: 'sub_category', as: 'incidentSubCategory' });
    };

    return Incident;
}