module.exports = (sequelize, DataTypes) => {
    const SchoolStructureHistory = sequelize.define('SchoolStructureHistory', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        actual_no_of_theaters: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_security_cameras: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_emergency_exits: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_fire_extinguishers: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_clinics: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_sand_buckets: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_classes: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_offices: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_toilets: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_stores: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_gates: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_security_rooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_admin_rooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_buildings: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_libraries: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_labs: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_workshops: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        actual_no_of_meeting_rooms: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        schoolId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'schools',
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
        tableName: 'schools_structure_history',
        timestamps: true,
        updatedAt: false,
    });

    SchoolStructureHistory.associate = (models) => {
        SchoolStructureHistory.belongsTo(models.School, { foreignKey: 'schoolId', as: 'school' });
    };

    return SchoolStructureHistory;
}