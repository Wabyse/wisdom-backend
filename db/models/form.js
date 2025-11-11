module.exports = (sequelize, DataTypes) => {
    const Form = sequelize.define('Form', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        en_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ar_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        code: {
            type: DataTypes.STRING
        },
        weight: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('360 Individual Assessment', 'ClassRoom Observation', '360 Curriculum Assessment', 'normal', 'curriculum', 'normal2', 'Watoms ClassRoom Observation')
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
        tableName: 'forms',
        timestamps: true,
        updatedAt: false,
    });

    Form.associate = (models) => {
        Form.hasMany(models.Field, { foreignKey: 'form_id', as: 'fields' });
        Form.belongsToMany(models.Program, {
            through: 'program_forms',
            foreignKey: 'form_id',
            otherKey: 'program_id',
            as: 'programs'
        });
    };

    return Form;
}