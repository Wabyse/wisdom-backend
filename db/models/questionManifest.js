module.exports = (sequelize, DataTypes) => {
    const QuestionManifest = sequelize.define('QuestionManifest', {
        code: {
            allowNull: false,
            primaryKey: true,
            type: DataTypes.STRING,
        },
        en_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ar_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        weight: {
            type: DataTypes.INTEGER,
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
        tableName: 'questions_manifest',
        timestamps: true,
        updatedAt: false,
    });

    QuestionManifest.associate = (models) => {
        QuestionManifest.hasMany(models.Question, { foreignKey: 'manifest_code', as: 'manifest' });
    };

    return QuestionManifest;
}