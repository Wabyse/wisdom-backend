module.exports = (sequelize, DataTypes) => {
    const SubjectSpecialization = sequelize.define('SubjectSpecialization', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
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
        specialization_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'specializations',
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
        tableName: 'subjectSpecialization',
        timestamps: true,
        updatedAt: false,
    });

    SubjectSpecialization.associate = (models) => {
        SubjectSpecialization.belongsTo(models.Subject, { foreignKey: 'subject_id', as: 'subject' });
        SubjectSpecialization.belongsTo(models.Specialization, { foreignKey: 'specialization_id', as: 'specialization' });
    };

    return SubjectSpecialization;
}