module.exports = (sequelize, DataTypes) => {
    const ProgramOrganization = sequelize.define('ProgramOrganization', {
        program_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'programs',
                key: 'id',
            },
            onDelete: 'CASCADE'
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'organizations',
                key: 'id',
            },
            onDelete: 'CASCADE'
        },
    }, {
        tableName: 'program_organizations',
        timestamps: false,
    });

    return ProgramOrganization;
};
