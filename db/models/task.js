module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        note: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        start_date: {
            type: DataTypes.DATE
        },
        end_date: {
            type: DataTypes.DATE
        },
        importance: {
            allowNull: false,
            type: DataTypes.ENUM('normal', 'important', 'urgent'),
        },
        size: {
            allowNull: false,
            type: DataTypes.ENUM('small', 'medium', 'large'),
        },
        assigner_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        assignee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        reviewer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        manager_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        file_path: {
            type: DataTypes.TEXT
        },
        assignee_status: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        manager_status: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        manager_quality: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        manager_speed: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        reviewer_status: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        reviewer_quality: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        reviewer_speed: {
            allowNull: false,
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        organization_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'organizations',
                key: 'id',
            },
            onDelete: 'RESTRICT'
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
        program_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'programs',
                key: 'id',
            },
            onDelete: 'RESTRICT'
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
        system: {
            allowNull: false,
            type: DataTypes.ENUM('watoms', 'wisdom', 'ebdaedu'),
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
        tableName: 'tasks',
        timestamps: true,
    });

    Task.associate = (models) => {
        Task.belongsTo(models.User, { foreignKey: 'assigner_id', as: 'assigner' });
        Task.belongsTo(models.User, { foreignKey: 'assignee_id', as: 'assignee' });
        Task.belongsTo(models.User, { foreignKey: 'reviewer_id', as: 'reviewer' });
        Task.belongsTo(models.User, { foreignKey: 'manager_id', as: 'manager' });
        Task.belongsTo(models.Organization, { foreignKey: 'organization_id', as: 'organization' });
        Task.belongsTo(models.Program, { foreignKey: 'program_id', as: 'program' });
        Task.belongsTo(models.Project, { foreignKey: 'project_id', as: 'project' });
        Task.belongsTo(models.Authority, { foreignKey: 'authority_id', as: 'authority' });
        Task.hasMany(models.TaskDetail, { foreignKey: 'task_id', as: 'details' });
    };

    return Task;
}