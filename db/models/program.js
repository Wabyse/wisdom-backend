module.exports = (sequelize, DataTypes) => {
    const Program = sequelize.define('Program', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        project_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'projects',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
    }, {
        tableName: 'programs',
        timestamps: true
    });

    Program.associate = (models) => {
        Program.belongsTo(models.Project, { foreignKey: 'project_id', as: 'project' });
        Program.belongsToMany(models.Organization, { through: 'program_organizations', foreignKey: 'program_id', otherKey: 'organization_id', as: 'organizations' });
        Program.hasMany(models.Task, { foreignKey: 'program_id', as: 'tasks' });
        Program.belongsToMany(models.Form, {
            through: 'program_forms',
            foreignKey: 'program_id',
            otherKey: 'form_id',
            as: 'forms'
        });
    };

    return Program;
};