module.exports = (sequelize, DataTypes) => {
    const School = sequelize.define('School', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        no_of_theaters: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_security_cameras: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_emergency_exits: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_fire_extinguishers: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_clinics: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_sand_buckets: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_classes: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_offices: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_toilets: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_stores: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_gates: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_security_rooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_admin_rooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_buildings: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_libraries: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_labs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_workshops: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        no_of_meeting_rooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
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
        tableName: 'schools',
        timestamps: true,
        updatedAt: false,
    });

    School.associate = (models) => {
        School.hasMany(models.Incident, { foreignKey: 'school_id', as: 'incidents' });
        School.hasMany(models.SchoolStructureHistory, { foreignKey: 'schoolId', as: 'structures' });
        School.belongsTo(models.Organization, { foreignKey: 'organizationId', as: 'org' });
    };

    return School;
}