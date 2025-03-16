module.exports = (sequelize, DataTypes) => {
    const TeacherEvaluation = sequelize.define('TeacherEvaluation', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        employee_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'employees',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        teacher_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'teachers',
                key: 'id',
            },
            onDelete: 'RESTRICT'
        },
        type: {
            type: DataTypes.ENUM('interview', 'test'),
            allowNull: false
        },
        first_result: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        second_result: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        third_result: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fourth_result: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        fifth_result: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        sixth_result: {
            type: DataTypes.INTEGER,
            allowNull: false
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
        tableName: 'teacher_evaluation',
        timestamps: true,
    });
    
    TeacherEvaluation.associate = (models) => {
        TeacherEvaluation.belongsTo(models.Employee, { foreignKey: 'employee_id', as: 'employee' });
        TeacherEvaluation.belongsTo(models.Teacher, { foreignKey: 'teacher_id', as: 'teacher' });
    };

    return TeacherEvaluation;
}