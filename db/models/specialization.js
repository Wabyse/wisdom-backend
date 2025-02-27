module.exports = (sequelize, DataTypes) => {
    const Specialization = sequelize.define('Specialization', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
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
        tableName: 'specializations',
        timestamps: true,
        updatedAt: false,
    });

    Specialization.associate = (models) => {
        Specialization.hasMany(models.Student, { foreignKey: 'specialization_id', as: 'students' });
        Specialization.hasMany(models.SubjectSpecialization, { foreignKey: 'specialization_id', as: 'subject' });
    };

    return Specialization;
}