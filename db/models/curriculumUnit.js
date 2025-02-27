module.exports = (sequelize, DataTypes) => {
    const CurriculumUnit = sequelize.define('CurriculumUnit', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        unit: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('ongoing', 'done', 'overdue', 'terminated', 'not started yet', 'in progress'),
            allowNull: false,
        },
        deadline: {
            type: DataTypes.DATEONLY
        },
        session_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'sessions',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        curriculum_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'curriculums',
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
        tableName: 'curriculums_units',
        timestamps: true
    });

    CurriculumUnit.associate = (models) => {
        CurriculumUnit.belongsTo(models.Session, { foreignKey: 'session_id', as: 'session' });
        CurriculumUnit.belongsTo(models.Curriculum, { foreignKey: 'curriculum_id', as: 'curriculum' });
    };

    return CurriculumUnit;
}