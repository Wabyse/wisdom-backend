module.exports = (sequelize, DataTypes) => {
    const Project = sequelize.define('Project', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        authority_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'authorities',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
    }, {
        tableName: 'projects',
        timestamps: true
    });

    Project.associate = (models) => {
        Project.belongsTo(models.Authority, { foreignKey: 'authority_id', as: 'authority' });
        Project.hasMany(models.Program, { foreignKey: 'project_id', as: 'programs' });
        Project.hasMany(models.Task, { foreignKey: 'project_id', as: 'tasks' });
    };

    return Project;
};