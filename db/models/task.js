module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        task: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        start_date: {
            type: DataTypes.DATE
        },
        end_date: {
            type: DataTypes.DATE
        },
        status: {
            allowNull: false,
            type: DataTypes.ENUM('0', '25', '50', '75', 'finished', 'on hold', 'in progress', 'past the due date', 'submitted', 'under review', 'not started yet'),
        },
        importance: {
            allowNull: false,
            type: DataTypes.ENUM('normal', 'important', 'urgent'),
        },
        task_size: {
            allowNull: false,
            type: DataTypes.ENUM('small', 'medium', 'large'),
        },
        sub_category: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'task_sub_categories',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        assignedBy_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        assignee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        file_path: {
            type: DataTypes.TEXT
        },
        submit_file_path: {
            type: DataTypes.TEXT
        },
        assigned_by_evaluation: {
            type: DataTypes.INTEGER,
        },
        manager_evaluation: {
            type: DataTypes.INTEGER,
        },
        reviewer_speed_percentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        manager_speed_percentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        reviewer_quality_percentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        manager_quality_percentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        reviewer_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'employees',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        manager_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'employees',
                key: 'id',
            },
            onDelete: 'SET NULL',
        },
        sub_task_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'tasks',
                key: 'id',
            },
            onDelete: 'RESTRICT'
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
        Task.belongsTo(models.TaskSubCategory, { foreignKey: 'sub_category', as: 'taskSubCategory' });
        Task.belongsTo(models.Employee, { foreignKey: 'assignedBy_id', as: 'assigner' });
        Task.belongsTo(models.Employee, { foreignKey: 'assignee_id', as: 'assignee' });
        Task.belongsTo(models.Employee, { foreignKey: 'reviewer_id', as: 'reviewer' });
        Task.belongsTo(models.Employee, { foreignKey: 'manager_id', as: 'manager' });
        Task.belongsTo(models.Task, { foreignKey: 'sub_task_id', as: 'mainTask' });
        Task.hasMany(models.Task, { foreignKey: 'sub_task_id', as: 'subTasks' });
    };

    return Task;
}