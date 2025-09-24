module.exports = (sequelize, DataTypes) => {
    const Curriculum = sequelize.define('Curriculum', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        code: {
            type: DataTypes.STRING(50),
            unique: true,
            allowNull: false,
        },
        no_of_units: {
            type: DataTypes.INTEGER
        },
        subject_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'subjects',
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
        tableName: 'curriculums',
        timestamps: true,
        updatedAt: false,
    });

    Curriculum.associate = (models) => {
        Curriculum.belongsTo(models.Subject, { foreignKey: 'subject_id', as: 'subject' });
        Curriculum.hasMany(models.CurriculumReport, { foreignKey: 'curriculum_id', as: 'reports' });
        Curriculum.hasMany(models.CurriculumUnit, { foreignKey: 'curriculum_id', as: 'units' });
        Curriculum.hasMany(models.TraineeRegistrationData, { foreignKey: 'course', as: 'registrations' });
    };

    return Curriculum;
}